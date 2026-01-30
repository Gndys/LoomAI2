from __future__ import annotations

import io
import os
import uuid
from dataclasses import dataclass
from typing import Dict, Optional

import cv2
import ezdxf
import numpy as np
import requests
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

APP_DATA_DIR = os.getenv("PNG_TO_DXF_DATA_DIR", "/tmp/png-to-dxf")
DEFAULT_THRESHOLD = 60
DEFAULT_LINE_WIDTH_MM = 0.3

os.makedirs(APP_DATA_DIR, exist_ok=True)

app = FastAPI(title="PNG to DXF Service", version="0.1.0")


class ConvertRequest(BaseModel):
    imageUrl: str = Field(..., description="Remote image URL")
    unit: str = Field("mm", pattern="^(mm|cm)$")
    dxfVersion: str = Field("R12", pattern="^(R12|R2000)$")
    threshold: int = Field(DEFAULT_THRESHOLD, ge=0, le=100)
    invert: bool = False
    lineWidth: float = Field(DEFAULT_LINE_WIDTH_MM, ge=0)


@dataclass
class Task:
    task_id: str
    status: str
    progress: int
    download_url: Optional[str]
    file_path: Optional[str]
    error: Optional[str] = None


TASKS: Dict[str, Task] = {}


def _download_image(url: str) -> np.ndarray:
    response = requests.get(url, timeout=20)
    response.raise_for_status()
    image_data = np.frombuffer(response.content, dtype=np.uint8)
    image = cv2.imdecode(image_data, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Unable to decode image")
    return image


def _threshold_image(image: np.ndarray, threshold: int, invert: bool) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thr = int(round(threshold / 100 * 255))
    if invert:
        _, binary = cv2.threshold(gray, thr, 255, cv2.THRESH_BINARY_INV)
    else:
        _, binary = cv2.threshold(gray, thr, 255, cv2.THRESH_BINARY)
    return binary


def _contours_to_dxf(binary: np.ndarray, output_path: str, dxf_version: str, line_width_mm: float) -> None:
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    doc = ezdxf.new(dxf_version)
    msp = doc.modelspace()
    line_weight = int(round(max(line_width_mm, 0) * 100))

    for contour in contours:
        if contour.shape[0] < 3:
            continue
        epsilon = 0.002 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        points = [(float(pt[0][0]), float(-pt[0][1])) for pt in approx]
        if len(points) < 2:
            continue
        msp.add_lwpolyline(points, close=True, dxfattribs={"lineweight": line_weight})

    doc.saveas(output_path)


def _process_task(task: Task, payload: ConvertRequest) -> Task:
    task.status = "processing"
    task.progress = 20

    image = _download_image(payload.imageUrl)
    task.progress = 50

    binary = _threshold_image(image, payload.threshold, payload.invert)
    task.progress = 70

    filename = f"{task.task_id}.dxf"
    file_path = os.path.join(APP_DATA_DIR, filename)
    _contours_to_dxf(binary, file_path, payload.dxfVersion, payload.lineWidth)

    task.file_path = file_path
    task.status = "completed"
    task.progress = 100
    return task


@app.post("/api/png-to-dxf")
async def create_task(payload: ConvertRequest, request: Request):
    task_id = uuid.uuid4().hex
    task = Task(task_id=task_id, status="pending", progress=0, download_url=None, file_path=None)
    TASKS[task_id] = task

    try:
        _process_task(task, payload)
    except Exception as exc:
        task.status = "failed"
        task.progress = 100
        task.error = str(exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    task.download_url = str(request.base_url) + f"api/png-to-dxf/files/{task_id}"
    return {
        "id": task.task_id,
        "status": task.status,
        "progress": task.progress,
        "downloadUrl": task.download_url,
    }


@app.get("/api/png-to-dxf")
async def get_task(taskId: str = Query(..., alias="taskId")):
    task = TASKS.get(taskId)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return {
        "id": task.task_id,
        "status": task.status,
        "progress": task.progress,
        "downloadUrl": task.download_url,
    }


@app.get("/api/png-to-dxf/files/{task_id}")
async def download_file(task_id: str):
    task = TASKS.get(task_id)
    if not task or not task.file_path:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(task.file_path, media_type="application/dxf", filename=f"pattern-{task_id}.dxf")

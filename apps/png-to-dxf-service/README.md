# PNG to DXF Service (Minimal)

Minimal conversion service that turns a line-art PNG/JPG into a DXF file.

## Features
- Binary threshold + contour tracing
- Outputs DXF (R12/R2000)
- In-memory task store (no queue)
- Immediate completion for small images

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 9010
```

## Configure Next App

Set the endpoint in your environment:

```
PNG_TO_DXF_ENDPOINT=http://localhost:9010/api/png-to-dxf
```

## API

POST `/api/png-to-dxf`

Request body:
```json
{
  "imageUrl": "https://.../image.png",
  "unit": "mm",
  "dxfVersion": "R12",
  "threshold": 60,
  "invert": false,
  "lineWidth": 0.3
}
```

Response:
```json
{
  "id": "task_id",
  "status": "completed",
  "progress": 100,
  "downloadUrl": "http://localhost:9010/api/png-to-dxf/files/task_id"
}
```

GET `/api/png-to-dxf?taskId=...`

Returns the same response shape as above.

## Notes
- 1 pixel = 1 unit (mm/cm) in this minimal implementation.
- For production quality, you will likely need DPI calibration and curve fitting.

'use client';

import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { authClientReact } from "@libs/auth/authClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Shield,
  CheckCircle,
  Edit,
  Save,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChangePasswordDialog } from "./components/change-password-dialog";
import { DeleteAccountDialog } from "./components/delete-account-dialog";
import { SubscriptionCard } from "./components/subscription-card";
import { LinkedAccountsCard } from "./components/linked-accounts-card";

export default function DashboardPage() {
  const { t, locale: currentLocale } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    image: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);

  const { 
    data: session, 
    isPending
  } = authClientReact.useSession();
  
  const user = session?.user;

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        image: user.image || ''
      });
      setLoading(false);
    } else if (!isPending) {
      setLoading(false);
    }
  }, [user, refreshKey, isPending]);

  // 格式化日期
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(currentLocale === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 获取用户角色显示名称
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return t.dashboard.roles.admin;
      case 'user':
        return t.dashboard.roles.user;
      default:
        return role;
    }
  };

  // 获取用户角色徽章颜色
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // 处理用户信息更新
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setUpdateLoading(true);
    try {
      await authClientReact.updateUser({
        name: editForm.name.trim() || undefined,
        image: editForm.image.trim() || undefined,
      });
      
      setIsEditing(false);
      toast.success(t.dashboard.profile.updateSuccess);
      
      // 强制刷新组件状态以确保显示最新数据
      setRefreshKey(prev => prev + 1);
      
      // 主动获取最新会话数据
      setTimeout(async () => {
        try {
          await authClientReact.getSession();
        } catch (error) {
          console.error('Failed to refresh session:', error);
        }
      }, 100);
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(t.dashboard.profile.updateError);
    } finally {
      setUpdateLoading(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditForm({
      name: user?.name || '',
      image: user?.image || ''
    });
    setIsEditing(false);
  };

  if (isPending || loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push(`/${currentLocale}/signin`);
    return null;
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t.dashboard.description}
          </p>
        </div>

        {/* 统一信息卡片 */}
        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* 用户信息区域 */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={isEditing ? editForm.image || user.image || "" : user.image || ""} 
                    alt={user.name || user.email || "User"} 
                  />
                  <AvatarFallback className="text-xl">
                    {(isEditing ? editForm.name || user.name : user.name)?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    // 编辑模式
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t.dashboard.profile.form.labels.name}</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={t.dashboard.profile.form.placeholders.name}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="image">{t.dashboard.profile.form.labels.image}</Label>
                        <Input
                          id="image"
                          value={editForm.image}
                          onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                          placeholder={t.dashboard.profile.form.placeholders.image}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleUpdateProfile} 
                          disabled={updateLoading}
                          size="sm"
                        >
                          {updateLoading ? (
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {t.dashboard.profile.updateProfile}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          disabled={updateLoading}
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          {t.dashboard.profile.cancel}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // 查看模式
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div>
                          <h2 className="text-2xl font-semibold">{user.name || t.dashboard.profile.noNameSet}</h2>
                          <p className="text-muted-foreground text-lg">{user.email}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t.dashboard.profile.editProfile}
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {t.dashboard.profile.role}
                          </span>
                          <Badge variant={getRoleBadgeVariant(user.role || 'user')}>
                            {getRoleDisplayName(user.role || 'user')}
                          </Badge>
                        </div>
                        
                        {user.emailVerified && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            {t.dashboard.profile.emailVerified}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 账户详情信息 - 仅在查看模式显示 */}
                  {!isEditing && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {t.dashboard.account.memberSince}
                        </span>
                        <span className="text-sm font-medium">
                          {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                        </span>
                      </div>
                      
                      {user.phoneNumber && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {t.dashboard.account.phoneNumber}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{user.phoneNumber}</span>
                            {user.phoneNumberVerified && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 分隔线 */}
              <hr className="border-border" />

              {/* 订阅状态区域 */}
              <SubscriptionCard />

              {/* 分隔线 */}
              <hr className="border-border" />

              {/* 关联账户区域 */}
              <LinkedAccountsCard />

              {/* 分隔线 */}
              <hr className="border-border" />

              {/* 账户管理区域 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t.dashboard.accountManagement.title}
                </h3>
                <div className="space-y-4">
                  {/* 密码管理 */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{t.dashboard.accountManagement.changePassword.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t.dashboard.accountManagement.changePassword.description}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowChangePasswordDialog(true)}
                      >
                        {t.dashboard.accountManagement.changePassword.button}
                      </Button>
                    </div>
                  </div>

                  {/* 账户删除 */}
                  <div className="border rounded-lg p-4 border-destructive/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-destructive">{t.dashboard.accountManagement.deleteAccount.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t.dashboard.accountManagement.deleteAccount.description}
                        </p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowDeleteAccountDialog(true)}
                      >
                        {t.dashboard.accountManagement.deleteAccount.button}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 更改密码对话框 */}
      <ChangePasswordDialog
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
      />

      {/* 删除账户确认对话框 */}
      <DeleteAccountDialog
        open={showDeleteAccountDialog}
        onOpenChange={setShowDeleteAccountDialog}
      />
    </div>
  );
} 
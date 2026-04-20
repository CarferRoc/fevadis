import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { supabase } from './utils/supabase';
import { theme } from './theme';

import { AuthGate } from './layouts/AuthGate';
import { TabsLayout } from './layouts/TabsLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { InstallPrompt } from './components/InstallPrompt';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

import { ActivitiesPage } from './pages/activities/ActivitiesPage';
import { ActivityDetailPage } from './pages/activities/ActivityDetailPage';
import { MyRegistrationsPage } from './pages/activities/MyRegistrationsPage';

import { InfoPage } from './pages/info/InfoPage';

import { ChatsListPage } from './pages/chats/ChatsListPage';
import { ChatPage } from './pages/chats/ChatPage';
import { GroupSettingsPage } from './pages/chats/GroupSettingsPage';

import { ProfilePage } from './pages/profile/ProfilePage';
import { UserDocumentsPage } from './pages/profile/UserDocumentsPage';
import { RewardsPage } from './pages/profile/RewardsPage';

import { AdminHomePage } from './pages/admin/AdminHomePage';
import { AdminActivitiesPage } from './pages/admin/AdminActivitiesPage';
import { AdminCreateActivityPage } from './pages/admin/AdminCreateActivityPage';
import { AdminEditActivityPage } from './pages/admin/AdminEditActivityPage';
import { AdminActivityAttendeesPage } from './pages/admin/AdminActivityAttendeesPage';
import { AdminRegistrationsPage } from './pages/admin/AdminRegistrationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUserDocumentsPage } from './pages/admin/AdminUserDocumentsPage';
import { AdminAuthorizedDnisPage } from './pages/admin/AdminAuthorizedDnisPage';
import { AdminCertificatesPage } from './pages/admin/AdminCertificatesPage';
import { AdminRewardsPage } from './pages/admin/AdminRewardsPage';
import { AdminRewardFormPage } from './pages/admin/AdminRewardFormPage';
import { AdminGroupChatsPage } from './pages/admin/AdminGroupChatsPage';
import { AdminCreateGroupChatPage } from './pages/admin/AdminCreateGroupChatPage';
import { AdminInfoPage } from './pages/admin/AdminInfoPage';

export default function App() {
    const { setSession, isLoading } = useAuthStore();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, s) => {
            setSession(s);
        });
        return () => subscription.unsubscribe();
    }, [setSession]);

    if (isLoading) {
        return (
            <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div
                    style={{
                        width: 32,
                        height: 32,
                        border: `3px solid ${theme.colors.primaryLight}`,
                        borderTopColor: theme.colors.primary,
                        borderRadius: '50%',
                        animation: 'fevadis-spin 0.8s linear infinite',
                    }}
                />
                <style>{`@keyframes fevadis-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="app-shell">
            <InstallPrompt />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<AuthGate />}>
                    <Route element={<TabsLayout />}>
                        <Route index element={<Navigate to="/activities" replace />} />
                        <Route path="/activities" element={<ActivitiesPage />} />
                        <Route path="/activities/my" element={<MyRegistrationsPage />} />
                        <Route path="/activities/:id" element={<ActivityDetailPage />} />

                        <Route path="/info" element={<InfoPage />} />

                        <Route path="/chats" element={<ChatsListPage />} />
                        <Route path="/chats/:chatId" element={<ChatPage />} />
                        <Route path="/chats/:chatId/settings" element={<GroupSettingsPage />} />

                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/profile/documents" element={<UserDocumentsPage />} />
                        <Route path="/profile/registrations" element={<MyRegistrationsPage />} />
                        <Route path="/profile/rewards" element={<RewardsPage />} />
                    </Route>

                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminHomePage />} />
                        <Route path="activities" element={<AdminActivitiesPage />} />
                        <Route path="activities/new" element={<AdminCreateActivityPage />} />
                        <Route path="activities/:id/edit" element={<AdminEditActivityPage />} />
                        <Route path="activities/:activityId/attendees" element={<AdminActivityAttendeesPage />} />
                        <Route path="registrations" element={<AdminRegistrationsPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="users/:userId/documents" element={<AdminUserDocumentsPage />} />
                        <Route path="dnis" element={<AdminAuthorizedDnisPage />} />
                        <Route path="certificates" element={<AdminCertificatesPage />} />
                        <Route path="rewards" element={<AdminRewardsPage />} />
                        <Route path="rewards/new" element={<AdminRewardFormPage />} />
                        <Route path="rewards/:rewardId/edit" element={<AdminRewardFormPage />} />
                        <Route path="group-chats" element={<AdminGroupChatsPage />} />
                        <Route path="group-chats/new" element={<AdminCreateGroupChatPage />} />
                        <Route path="info" element={<AdminInfoPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

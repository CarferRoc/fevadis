import { NavigatorScreenParams } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

// ─── Activities Stack ─────────────────────────────────────────────────────────
export type ActivitiesStackParamList = {
    ActivitiesList: undefined;
    ActivityDetail: { id: string };
    MyRegistrations: undefined;
};

// ─── Chats Stack ─────────────────────────────────────────────────────────────
export type ChatsStackParamList = {
    ChatsList: undefined;
    Chat: { chatId: string; otherUserName: string; isGroup?: boolean; isAdmin?: boolean; onlyAdminsCanSpeak?: boolean };
    GroupSettings: { chatId: string; initialSettings: boolean };
};

// ─── Admin Stack ─────────────────────────────────────────────────────────────
export type AdminStackParamList = {
    AdminHome: undefined;
    AdminActivities: undefined;
    AdminCreateActivity: undefined;
    AdminEditActivity: { id: string };
    AdminRegistrations: undefined;
    AdminUsers: undefined;
    AdminAuthorizedDnis: undefined;
    AdminUserDocuments: { userId: string; userName: string };
    AdminCertificates: undefined;
    AdminActivityAttendees: { activityId: string; activityTitle: string };
    AdminRewards: undefined;
    AdminRewardForm: { rewardId?: string };
    AdminGroupChats: undefined;
    AdminCreateGroupChat: undefined;
};

// ─── Perfil Stack ─────────────────────────────────────────────────────────────
export type ProfileStackParamList = {
    ProfileMain: undefined;
    AdminNavigator: NavigatorScreenParams<AdminStackParamList>;
    UserDocuments: undefined;
    MyRegistrations: undefined;
    Rewards: { puntos: number };
};

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────
export type AppTabParamList = {
    Actividades: NavigatorScreenParams<ActivitiesStackParamList>;
    Información: undefined;
    Chats: NavigatorScreenParams<ChatsStackParamList>;
    Perfil: NavigatorScreenParams<ProfileStackParamList>;
};

// ─── Root Stack ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    App: NavigatorScreenParams<AppTabParamList>;
};

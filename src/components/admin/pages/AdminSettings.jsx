import React, { useState } from 'react';
import {
    Bell,
    User,
    Shield,
    Settings as SettingsIcon,
    Save,
    RotateCcw,
    Download,
    Key,
    Database,
    Globe,
    Monitor
} from 'lucide-react';

const Switch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex-1">
            {label && <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>}
            {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#9F7539]' : 'bg-gray-200 dark:bg-white/10'
                }`}
        >
            <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out ${checked ? 'translate-x-5.5' : 'translate-x-1'
                    }`}
            />
        </button>
    </div>
);

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        notifications: {
            newApplications: true,
            paymentUpdates: true,
            maintenanceRequests: false,
            systemUpdates: true,
            activityAlerts: true,
            weeklyReports: false,
        },
        account: {
            fullName: 'Adebayo Ogundimu',
            email: 'adebayo@domihive.com',
            phone: '+234 801 234 5678',
            timezone: 'West Africa Time (WAT)',
        },
        security: {
            twoFactor: true,
            loginNotifications: true,
        },
        system: {
            dashboardLayout: 'Compact View',
            exportFormat: 'Excel (.xlsx)',
            currency: 'Nigerian Naira (₦)',
            showGridLines: false,
            autoBackup: true,
            dateFormat: 'DD/MM/YY',
        }
    });

    const handleToggle = (category, field) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: !prev[category][field]
            }
        }));
    };

    const handleChange = (category, field, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white">System Settings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your system preferences, notifications, and account settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Settings Content */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Notification Preferences */}
                    <section className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/5 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-[#9F7539]">
                            <Bell size={18} />
                            <h2 className="text-lg font-semibold text-[#0e1f42] dark:text-white">Notification Preferences</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            <div>
                                <h3 className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mb-4 tracking-wider">Email Notifications</h3>
                                <div className="space-y-4">
                                    <Switch
                                        label="New Applications"
                                        description="Receive notifications when new tenant applications are submitted"
                                        checked={settings.notifications.newApplications}
                                        onChange={() => handleToggle('notifications', 'newApplications')}
                                    />
                                    <Switch
                                        label="Payment Updates"
                                        description="Get notified about rent payments and payment issues"
                                        checked={settings.notifications.paymentUpdates}
                                        onChange={() => handleToggle('notifications', 'paymentUpdates')}
                                    />
                                    <Switch
                                        label="Maintenance Requests"
                                        description="Notifications for new maintenance and repair requests"
                                        checked={settings.notifications.maintenanceRequests}
                                        onChange={() => handleToggle('notifications', 'maintenanceRequests')}
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mb-4 tracking-wider">In-App Notifications</h3>
                                <div className="space-y-4">
                                    <Switch
                                        label="System Updates"
                                        description="Important system announcements and updates"
                                        checked={settings.notifications.systemUpdates}
                                        onChange={() => handleToggle('notifications', 'systemUpdates')}
                                    />
                                    <Switch
                                        label="Activity Alerts"
                                        description="Real-time alerts for property and tenant activities"
                                        checked={settings.notifications.activityAlerts}
                                        onChange={() => handleToggle('notifications', 'activityAlerts')}
                                    />
                                    <Switch
                                        label="Weekly Reports"
                                        description="Weekly summary reports of property performance"
                                        checked={settings.notifications.weeklyReports}
                                        onChange={() => handleToggle('notifications', 'weeklyReports')}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Account Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/5 p-6 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2 mb-6 text-[#9F7539]">
                                <User size={18} />
                                <h2 className="text-lg font-semibold text-[#0e1f42] dark:text-white">Account Settings</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        value={settings.account.fullName}
                                        onChange={(e) => handleChange('account', 'fullName', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm text-[#0e1f42] dark:text-white focus:outline-none focus:border-[#9F7539]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        value={settings.account.email}
                                        onChange={(e) => handleChange('account', 'email', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm text-[#0e1f42] dark:text-white focus:outline-none focus:border-[#9F7539]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            type="text"
                                            value={settings.account.phone}
                                            onChange={(e) => handleChange('account', 'phone', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm text-[#0e1f42] dark:text-white focus:outline-none focus:border-[#9F7539]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time Zone</label>
                                        <input
                                            type="text"
                                            value={settings.account.timezone}
                                            onChange={(e) => handleChange('account', 'timezone', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm text-[#0e1f42] dark:text-white focus:outline-none focus:border-[#9F7539]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/5 p-6 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2 mb-6 text-[#9F7539]">
                                <Shield size={18} />
                                <h2 className="text-lg font-semibold text-[#0e1f42] dark:text-white">Security Options</h2>
                            </div>
                            <div className="space-y-6 flex-1">
                                <Switch
                                    label="Two-Factor Authentication"
                                    description="Add extra security to your account"
                                    checked={settings.security.twoFactor}
                                    onChange={() => handleToggle('security', 'twoFactor')}
                                />
                                <Switch
                                    label="Login Notifications"
                                    description="Get notified of new login attempts"
                                    checked={settings.security.loginNotifications}
                                    onChange={() => handleToggle('security', 'loginNotifications')}
                                />
                                <div className="pt-4">
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium">
                                        <Key size={16} />
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* System Preferences */}
                    <section className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/5 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-[#9F7539]">
                            <SettingsIcon size={18} />
                            <h2 className="text-lg font-semibold text-[#0e1f42] dark:text-white">System Preferences</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Display Settings</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dashboard Layout</label>
                                        <select
                                            value={settings.system.dashboardLayout}
                                            onChange={(e) => handleChange('system', 'dashboardLayout', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm text-[#0e1f42] dark:text-white focus:outline-none focus:border-[#9F7539]"
                                        >
                                            <option>Compact View</option>
                                            <option>Wide View</option>
                                        </select>
                                    </div>
                                    <Switch
                                        label="Show Grid Lines"
                                        checked={settings.system.showGridLines}
                                        onChange={() => handleToggle('system', 'showGridLines')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Data & Export</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default Export Format</label>
                                        <select
                                            value={settings.system.exportFormat}
                                            onChange={(e) => handleChange('system', 'exportFormat', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm text-[#0e1f42] dark:text-white focus:outline-none focus:border-[#9F7539]"
                                        >
                                            <option>Excel (.xlsx)</option>
                                            <option>CSV (.csv)</option>
                                            <option>PDF (.pdf)</option>
                                        </select>
                                    </div>
                                    <Switch
                                        label="Auto-backup Data"
                                        checked={settings.system.autoBackup}
                                        onChange={() => handleToggle('system', 'autoBackup')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Regional Settings</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Currency</label>
                                        <select
                                            value={settings.system.currency}
                                            onChange={(e) => handleChange('system', 'currency', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm text-[#0e1f42] dark:text-white focus:outline-none focus:border-[#9F7539]"
                                        >
                                            <option>Nigerian Naira (₦)</option>
                                            <option>US Dollar ($)</option>
                                            <option>British Pound (£)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Format</label>
                                        <select
                                            value={settings.system.dateFormat}
                                            onChange={(e) => handleChange('system', 'dateFormat', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm text-[#0e1f42] dark:text-white focus:outline-none focus:border-[#9F7539]"
                                        >
                                            <option>DD/MM/YY</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/5 p-4 shadow-sm sticky top-20">
                        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-4">Quick Settings</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#9F7539] hover:bg-[#866231] text-white rounded-lg transition-colors text-sm font-medium">
                                <Save size={16} />
                                Save Settings
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-transparent border border-[#9F7539]/20 hover:bg-gray-50 dark:hover:bg-white/5 text-[#9F7539] rounded-lg transition-colors text-sm font-medium">
                                <RotateCcw size={16} />
                                Reset to Default
                            </button>
                            <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium">
                                    <Download size={16} />
                                    Export Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;

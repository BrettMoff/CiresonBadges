/* Create_BadgesSettingsItems.sql v1.2 */

DELETE FROM ServiceManagement.dbo.SettingsItem where SettingsItem.[KEY] like 'Badge-%'

INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge-MyRequests', 0, 'FALSE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge-TeamRequests', 0, 'FALSE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge-MyWork', 0, 'TRUE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge-TeamWork', 0, 'FALSE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge-ActiveWork', 0, 'FALSE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge-WatchList', 0, 'FALSE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge-DaysBeforeStale', 0, '3', GETUTCDATE())

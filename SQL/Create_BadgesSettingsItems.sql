/* Create_BadgesSettingsItems.sql v1.4 */

DELETE FROM ServiceManagement.dbo.SettingsItem where SettingsItem.[KEY] like 'Badge-%'
DELETE FROM ServiceManagement.dbo.SettingsItem where SettingsItem.[KEY] like 'Badge Title -%'
DELETE FROM ServiceManagement.dbo.SettingsItem where SettingsItem.[KEY] like 'Badge -%'
DELETE FROM ServiceManagement.dbo.SettingsItem where SettingsItem.[KEY] like 'Badge Enabled -%'

INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge - Days Before Stale', 0, '3', GETUTCDATE())

INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Enabled - My Requests', 0, 'TRUE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Enabled - Team Requests', 0, 'TRUE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Enabled - My Work', 0, 'TRUE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Enabled - Team Work', 0, 'TRUE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Enabled - Active Work', 0, 'TRUE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Enabled - Watch List', 0, 'TRUE', GETUTCDATE())

INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge My Work - Include Activities', 0, 'FALSE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Team Work - Include Activities', 0, 'FALSE', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Active Work - Include Activities', 0, 'FALSE', GETUTCDATE())

INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Title - My Requests', 0, 'My Requests', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Title - Team Requests', 0, 'Team Requests', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Title - My Work', 0, 'My Work', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Title - Team Work', 0, 'Team Work', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Title - Active Work', 0, 'Active Work', GETUTCDATE())
INSERT INTO ServiceManagement.dbo.SettingsItem ([Key], [TenantId], [Value], ModifiedDate) VALUES ('Badge Title - Watch List', 0, 'Watch List', GETUTCDATE())

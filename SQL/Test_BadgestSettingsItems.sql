/* Badges All Work */
SELECT * from ServiceManagement.dbo.SettingsItem
where SettingsItem.[Key] in (
'Badge-MyRequests'
,'Badge-TeamRequests'
,'Badge-MyWork'
,'Badge-TeamWork'
,'Badge-ActiveWork'
,'Badge-WatchList'
)
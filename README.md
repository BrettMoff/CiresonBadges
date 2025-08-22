# CiresonBadges
Work Item Badge Count Extension for Cireson Analyst Portal. v1.4

Instructions: 
1. Run the SQL query to insert configuration settings into the ServiceManagement SettingItems table.
2. Copy the custom_WorkItemMenuBadge.js file into your CustomSpace folder
3. Copy the code within custom.js into your own custom.js file. 
4. Restart your client-side browser session. Adding a new Setting Item needs to be cached upon initial login.
5. Go to the settings page within the Cireson portal to configure the badges as desired.

################# BADGE COLOUR MEANING #################
BLUE = Work Item Count
ORANGE = Work Items that are not assigned to an analyst
RED = Work Items that have not been updated in X (3) days

################# SETTINGS #################
* Badge - Days Before Stale: 
	Possible Values: 0-3650
	Affected Views:
		-	My Requests
		-	Team Requests
		-	Active Work
		-	My Work
		-	Team Work
	Affect:
		The affected views will have a Red badge that will show a count of work items that have not been modified in this number of days.
		If this setting is set to 0, the red badge will be disabled.
		If this setting is set to 1, and a work item is created late in the day, it will still be marked as stale the next day.
		
* Badge Enbaled - <ViewName>:
	Possible Values: TRUE\FALSE
	Affected Views:
		-	My Requests
		-	Team Requests
		-	Active Work
		-	My Work
		-	Team Work
		-	Watch List
	Affect:
		This setting will enable or disable the badge solution for the affected view
	
* Badge <ViewName> - Include Activities:
	Possible Values: TRUE\FALSE
	Affected Views:
		-	Active Work
		-	My Work
		-	Team Work
	Affect:
		Enabling this setting will count active Activities within the affected view
	
* Badge Title - <ViewName>: 
	Possible Values: <Text>
	Affected Views:
		-	My Requests
		-	Team Requests
		-	Active Work
		-	My Work
		-	Team Work
		-	Watch List
	Affect:
		It is possible to rename the default views to a custom name to allow companies to customise the interface.
		This setting (per view) is used to provide the new name of the default view so the badges can be targeted at the correct view.
		
		
Notes:
If a navigation node has both an orange badge and a red badge, then the orange badge will be shown and the red badge will be ignored.

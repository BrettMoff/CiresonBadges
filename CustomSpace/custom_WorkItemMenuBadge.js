/* ------------------------------------------------------- */
/* -------------- Custom WorkItem Menu Badge ------------- */
/* ------------------------------------------------------- */
/*
Author: Martin Blomgren, Brian Wiest, Eric Brown, Brett Moffett, Joivan Hedrick
Description: Adds a custom badge on the menu item counting all active work items. Refreshes every minute.

v1.4.1	Added support for enabling and disabling Activities
		Added Team Work with Activities SQL rather than API
		Edited some loggingImproved ReadMe instructions
v1.3.1  Bug fix: Checking for settings values can fail
		Improved clarity of logging
v1.3	Added Badge Title to settings to allow for renaming of the default views
		Renamed settings values to be more user friendly (Badge Enabled - ....)
		Added more comments and logging.
v1.2.1	Make the Stale work Item setting lookup more efficient
v1.2	Add setting for configuring the number of days for Stale work items
v1.1	Replace GetGridWorkItemsAll API call with GetDashboardDataById API call
v0.6 	Added comments through the code to make it easier to diagnose issues and expand
v0.5 	Added left and right badges to allow display of 2 counts on each view
v0.4 	Added badge to My Work view that shows number of Work Items that have not been updated in X days
v0.3 	Added Unassigned for Team Work
v0.2 	Fixed so badges loads on first pageload, added watch list & team requests,
		added setting to choose which badges to load, removed line when there is no items.
v0.1 	initial release


TO DO LIST:
Team Request SQL sources rather than API
Watch List SQL sources rather than API
*/
$(document).ready(function () {
	// Chck to see if the user that is logged on is an end user or Analyst
	if (session.user.Analyst != 1 && session.user.IsAdmin != true) { 
		return; //User is an end user so quit out.
	} 
	
	var varLogging = 'FALSE'
	if (varLogging.toUpperCase() == "TRUE") {console.log("Cireson Badges logging enabled");}
	
	// SQL Data Sources that return the data needed for the solution.
	var guidDataSource_MyWork = '6DAF2352-3661-A776-47FB-9EE52BC47881';
	var guidDataSource_MyWorkWithActivities = '';
	var guidDataSource_ActiveWork = 'A1FDBF16-7A53-D471-4893-0CA219483B0F';
	//var guidDataSource_ActiveWorkWithActivities = 'd569c120-2c23-4a4a-9c3e-60b2cbbb020a';
	var guidDataSource_TeamWork = 'AFD60BBA-4648-4110-B6C2-0FF233D4587F';
	var guidDataSource_MyRequests = '4876b613-fa75-421b-9345-8c570821b55e';
	//var guidDataSource_TeamRequests = ''; //TO DO: Need to replace with SQL query to make faster
	//var guidDataSource_WatchList = ''; //TO DO: Need to replace with SQL query to make faster
		
	var dateBadgesStartDateTime = new Date(); //We don't want it to run forever, even after the page has timed out.
	
	//This section is used to observe the portal code loading and wait for the right pieces to load before continuing to execute.
	var badgeObserver = new MutationObserver(function (mutations) {
		var targetElement = $('#side_nav');
		if(targetElement.length > 0) {
			fn_ApplyStyleSheetBadge(); // Add CSS rules in anticipation of loading the badges successfully
			fn_createBadgeVariables(); // This will run on page load and create empty variables for each badge, then load the badge but only if enabled in settings
			/*objBadgesIntervalTimerId = setInterval(function () {
				fn_createBadgeVariables() // this will run after every 60 seconds
			}, 60000); */

			badgeObserver.disconnect();
		}
	});
	// Set the observer to notify me of everything!
	var observerConfig = {
		attributes: true,
		childList: false,
		characterData: false,
		subtree: true
	};
	// Now that the observer has been set we need to run the code to wait for the pieces we need to load.
	// Node, config
	$(document).ready(function () {
		var targetNode = document.getElementById('main_wrapper');
		badgeObserver.observe(targetNode, observerConfig);
	});
//*************************************************************************************************************************************************************************
	// Define the style of the badges as they appear on screen.
    function fn_ApplyStyleSheetBadge() {
        var addRule = (function(style){
            var sheet = document.head.appendChild(style).sheet;
            return function(selector, css){
                var propText = Object.keys(css).map(function(p){
                    return p+":"+css[p]
                }).join(";");
                sheet.insertRule(selector + "{" + propText + "}", sheet.cssRules.length);
            }
        })(document.createElement("style"));
		
		// Style that is common to ALL badges
        addRule(".menu-badge", {
            "background": "#E9001B",
            "background-image": "linear-gradient(to bottom, #00aaff, #037bb7)",
            "border": "1px solid #037bb7",
            "border-radius": "10px",
            "color": "white",
            "font-family": "Arial, sans-serif",
            "font-size": "11px",
            "font-weight": "bold",
            "line-height": "16px",
            "position": "absolute",
			"top": "4px",
            "padding": "0px 5px",
            "text-shadow": "0 1px rgba(0, 0, 0, 0.25)",
            "box-shadow": "inset 0 1px rgba(255, 255, 255, 0.3), 0 1px 1px rgba(0, 0, 0, 0.08)"
        });
		
		// Style that is common to LEFT badges
		addRule(".menu-leftbadge", {
            "left": "4px",
		});
		
		// Style that is common to RIGHT badges
		addRule(".menu-rightbadge", {
            "right": "4px",
		});
		
		// Style that is common to Unassigned badges
        addRule(".menu-badgestale", {
            "background": "#E9001B", //red
            "background-image": "linear-gradient(to bottom, #FF0000, #8B0000)",
            "border": "1px solid #8B0000",
			"color": "white",
        });
		
		// Style that is common to Needs Updating badges
		addRule(".menu-badgeunassigned", {
            "background": "#ff9400", //orange
            "background-image": "linear-gradient(to bottom, #ff9400, #8b5100)",
            "border": "1px solid #8b5100",
			"color": "white",
        });

		addRule(".no-badge", {
			"border": "none"
        });
    }
	
//*************************************************************************************************************************************************************************
	// Create menu-badges varibale for each of the views ready to be used but not filled with data.
	// These can be enabled and disabled by commenting out the badges not wanted. These are also controlled via Portal settings. 
	var fn_createBadgeVariables = function() {
		
		//initialize our badge objects.
		var badgeObject_MyRequests = 	{navTitleSetting: "Badge Title - My Requests", 
										  defaultTitle: "My Requests",
										  settingKey: "Badge Enabled - My Requests",
										  activityEnabled: null, //Enable or disable counting active activities on badges not needed on this view
										  bl_BadgeEnabled: null, 
										  apiString: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + guidDataSource_MyRequests, 
										  apiStringWithActivity: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter" + "&queryId=" + guidDataSource_MyRequests, 
										  apiStringWithoutActivity: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter" + "&queryId=" + guidDataSource_MyRequests, 
										  blnShowUnassignedItems: false,
										  blnShowStaleItems: true
										}; 
		var badgeObject_MyWork = 		{navTitleSetting: "Badge Title - My Work", 
										  defaultTitle: "My Work",
										  settingKey: "Badge Enabled - My Work",
										  activityEnabled: "Badge My Work - Include Activities", //Enable or disable counting active activities on badges
										  bl_BadgeEnabled: null, 
										  apiString: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + guidDataSource_MyWork,
										  apiStringWithActivity: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + guidDataSource_MyWorkWithActivities, 
										  apiStringWithoutActivity: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + guidDataSource_MyWork, 
										  blnShowUnassignedItems: false,
										  blnShowStaleItems: true
										};
		var badgeObject_TeamWork = 		{navTitleSetting: "Badge Title - Team Work", 
										  defaultTitle: "Team Work",
										  settingKey: "Badge Enabled - Team Work",
										  activityEnabled: "Badge Team Work - Include Activities", //Enable or disable counting active activities on badges
										  bl_BadgeEnabled: null, 
										  apiString: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + guidDataSource_TeamWork + "&ShowActivities=False",
										  apiStringWithActivity: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + guidDataSource_TeamWork + "&ShowActivities=True",
										  apiStringWithoutActivity: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + guidDataSource_TeamWork + "&ShowActivities=False",
										  blnShowUnassignedItems: true,
										  blnShowStaleItems: true
										};
		var badgeObject_ActiveWork = 	{navTitleSetting: "Badge Title - Active Work", 
										  defaultTitle: "Active Work",
										  settingKey: "Badge Enabled - Active Work",
										  activityEnabled: "Badge Active Work - Include Activities", //Enable or disable counting active activities on badges
										  bl_BadgeEnabled: null, 
										  apiString: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + guidDataSource_ActiveWork + "&ShowActivities=False",
										  apiStringWithActivity: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + guidDataSource_ActiveWork + "&ShowActivities=True",
										  apiStringWithoutActivity: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter&queryId=" + guidDataSource_ActiveWork + "&ShowActivities=False",
										  blnShowUnassignedItems: true,
										  blnShowStaleItems: true
										 };
		var badgeObject_TeamRequests = 	{navTitleSetting: "Badge Title - Team Requests", 
										  defaultTitle: "Team Requests",
										  settingKey: "Badge Enabled - Team Requests",
										  activityEnabled: null, //Enable or disable counting active activities on badges not needed on this view
										  bl_BadgeEnabled: null, 
										  apiString: "/api/V3/WorkItem/GetMyTeamRequest?userId=" + session.user.Id + "&showInactiveItems=false&isScoped=false",
										  apiStringWithActivity: "/api/V3/WorkItem/GetMyTeamRequest?userId=" + session.user.Id + "&showInactiveItems=false&isScoped=false",
										  apiStringWithoutActivity: "/api/V3/WorkItem/GetMyTeamRequest?userId=" + session.user.Id + "&showInactiveItems=false&isScoped=false",
										  blnShowUnassignedItems: false,
										  blnShowStaleItems: true
										};
		var badgeObject_WatchList = 	{navTitleSetting: "Badge Title - Watch List", 
										  defaultTitle: "Watch List",
										  settingKey: "Badge Enabled - Watch List",
										  activityEnabled: null, //Enable or disable counting active activities on badges not needed on this view
										  bl_BadgeEnabled: null, 
										  apiString: "/api/V3/WorkItem/GetWatchListByUserId?userId=" + session.user.Id,
										  apiStringWithActivity: "/api/V3/WorkItem/GetWatchListByUserId?userId=" + session.user.Id,
										  apiStringWithoutActivity: "/api/V3/WorkItem/GetWatchListByUserId?userId=" + session.user.Id,
										  blnShowUnassignedItems: false,
										  blnShowStaleItems: false
										};		
		//Get the number of days from settings for Days Before Stale Work Items
		$.ajax({
			url: "/api/V3/Settings/GetSetting?settingKey=Badge - Days Before Stale",
			type: "GET",
			async: true,
			success: function (daysBeforeStaleSettingData){
				// ********** Validate the settings returned ********
					if (daysBeforeStaleSettingData == null) { //Setting value not found. Create_BadgesSettingsItems.sql might need to be run
						throw "The Setting for Badge-DaysBeforeStale was not found. Ensure Create_BadgesSettingsItems.sql was run and the setting values exist.";
					}
					else 
						var intStaleDays = daysBeforeStaleSettingData.Value	
					if (intStaleDays == null) { //Setting is found but a NULL value has been found.
						throw "Setting value for Badge-DaysBeforeStale is null. Does it have a numeric value, and was the client session restarted?";
					}
				// *************************************************************
				if (varLogging.toUpperCase() == "TRUE") {console.log("Days before Stale Settings Data value " + daysBeforeStaleSettingData.Value);}
				// Check settings and load badges if necessary.
				GetSettingsValueAndLoadBadges(badgeObject_MyWork, intStaleDays);
				GetSettingsValueAndLoadBadges(badgeObject_TeamWork, intStaleDays);
				GetSettingsValueAndLoadBadges(badgeObject_ActiveWork, intStaleDays);
				GetSettingsValueAndLoadBadges(badgeObject_MyRequests, intStaleDays);
				GetSettingsValueAndLoadBadges(badgeObject_TeamRequests, intStaleDays);
				GetSettingsValueAndLoadBadges(badgeObject_WatchList, intStaleDays);
			}
		});
	}
	
	//param thisBadgeObject contains:
	//	navTitle, the human-readable text that appears in the navigation node on the left. The badges will appear here.
	//	settingKey, like 'Badge-MyWork'
	//	apiString, Either a GetDashboardDataById call, or OOB call like GetGridWorkItemsMyRequests.
	//	blnShowUnassignedItems, decides if we show items that have no assigned user.
	//	blnShowStaleItems, decides if we show stale non-modified item badge on the left.
	function GetSettingsValueAndLoadBadges(thisBadgeObject, intStaleDays) {
		if (varLogging.toUpperCase() == "TRUE") {console.log("Getting badge setting for '" + thisBadgeObject.settingKey);}
		$.ajax({
			url: "/api/V3/Settings/GetSetting?settingKey=" + thisBadgeObject.settingKey,
			type: "GET",
			async: true,
			success: function (fn_BadgeEnabledSetting){
				// ********** Validate the settings returned ********
					if (fn_BadgeEnabledSetting == null) { //Setting value not found. Create_BadgesSettingsItems.sql might need to be run
						throw "The Setting for '" + thisBadgeObject.settingKey + "' was not found. Ensure Create_BadgesSettingsItems.sql was run and the setting values exist.";
					}
					else if (fn_BadgeEnabledSetting.Value == null) { //Setting is found but a NULL value has been found.
						throw "Setting value for '" + thisBadgeObject.settingKey + "' is null. Does it have a TRUE/FALSE value, and was the client session restarted?";
					}
					
					var bl_BadgeEnbaledValue = fn_BadgeEnabledSetting.Value;
					if (bl_BadgeEnbaledValue.toUpperCase() != "TRUE") { //Setting is found but is set to FALSE.
						if (varLogging.toUpperCase() == "TRUE") {console.log("Badge setting for '" + thisBadgeObject.settingKey + "' is set to disabled. Ignoring.");}
						return;
					}
				// *************************************************************
				if (varLogging.toUpperCase() == "TRUE") {console.log("Badge setting for '" + thisBadgeObject.settingKey + "' is set to " + fn_BadgeEnabledSetting.Value);}
				
				// ***************** Show or Hide Activities *******************
				if (thisBadgeObject.activityEnabled == null){
					thisBadgeObject.apiString = thisBadgeObject.apiStringWithoutActivity
					if (varLogging.toUpperCase() == "TRUE") {console.log(thisBadgeObject.defaultTitle + " does not have activities and therefore can not be enabled.");}
				}
				else {
					$.ajax({
						url: "/api/V3/Settings/GetSetting?settingKey=" + thisBadgeObject.activityEnabled,
						type: "GET",
						async: false,
						success: function (fn_ActivityEnabledSetting){
								// ********** Validate the settings returned ********
								if (fn_ActivityEnabledSetting == null) { //Setting value not found. Create_BadgesSettingsItems.sql might need to be run
									throw "The Setting for '" + thisBadgeObject.activityEnabled + "' was not found. Ensure Create_BadgesSettingsItems.sql was run and the setting values exist.";
								}
								else if (fn_ActivityEnabledSetting.Value == null) { //Setting is found but a NULL value has been found.
									throw "Setting value for '" + thisBadgeObject.activityEnabled + "' is null. **" + fn_ActivityEnabledSetting.Value + "**Does it have a TRUE/FALSE value, and was the client session restarted?";
								}	
								var bl_BadgeActivityEnbaledValue = fn_ActivityEnabledSetting.Value;
								if (bl_BadgeActivityEnbaledValue.toUpperCase() != "TRUE") { //Setting is found but is set to FALSE.
									thisBadgeObject.apiString = thisBadgeObject.apiStringWithoutActivity
									if (varLogging.toUpperCase() == "TRUE") {console.log(thisBadgeObject.defaultTitle + " activities disabled. API call set to " + thisBadgeObject.apiString);}
									return;
								}
								else {
									thisBadgeObject.apiString = thisBadgeObject.apiStringWithActivity
									if (varLogging.toUpperCase() == "TRUE") {console.log(thisBadgeObject.defaultTitle + " activities enabled. API call set to " + thisBadgeObject.apiString);}
									return;
								}
							// *************************************************************
						}
					});
					// *************************************************************
				}
				
				// ********** Get API Query Results ***************
				$.ajax({
					url: thisBadgeObject.apiString,
					type: "GET",
					async: true,
					success: function (queryResults){
						thisBadgeObject.data = queryResults;
						try{
							fn_ShowBadgesFromBadgeObject(thisBadgeObject, intStaleDays);
							var dateNow = new Date();
							var dateTwoHoursAgo = dateNow.setHours(dateNow.getHours()-2);
							dateTwoHoursAgo = new Date(dateTwoHoursAgo);
							
							if (dateBadgesStartDateTime > dateTwoHoursAgo) {
								setTimeout( function() { GetSettingsValueAndLoadBadges(thisBadgeObject) }, 60000); //Re-run this same parent method every 60 seconds, assuming it didn't crash or something.
							}
							else{
								console.log("Exiting Badges script after page inactivity.");
								return;
							}
						}
						catch(error) {
							console.log("Error occurred during fn_ShowBadgesFromBadgeObject for '" + thisBadgeObject.settingKey + "'.");
							throw error;
						}
					}
				});
				// *************************************************************
			}
		});
	}
	
	//param thisBadgeObject contains:
	//	navTitle, like "My Work". The human-readable text that appears in the navigation node on the left. The badges will appear here.
	//  settingKey, like 'Badge-MyWork';
	//  bl_BadgeEnabled, like 'TRUE';
	//	dataSourceGuid for API Dashboard lookups.
	//	data, the returned work items from our dashboard query.
	//	blnShowUnassignedItems, decides if we show items that have no assigned user.
	//	blnShowStaleItems, decides if we show stales non-modified item badge on the left.
	function fn_ShowBadgesFromBadgeObject(thisBadgeObject, intStaleDays) {

		var data = thisBadgeObject.data;
		if (data.length == 0) {
			return;
		}
		
		$.ajax({
			url: "/api/V3/Settings/GetSetting?settingKey=" + thisBadgeObject.navTitleSetting,
			type: "GET",
			async: true,
			success: function (fn_BadgeTitleSetting){
			
				var str_BadgeTitleValue = fn_BadgeTitleSetting.Value;
				// ********** Validate the settings returned ********
					if (str_BadgeTitleValue == "") { //Setting is found but a NULL value has been found.
						if (varLogging.toUpperCase() == "TRUE") {console.log("Name value for '" + thisBadgeObject.navTitleSetting + "' is null. Setting to default value of '" + thisBadgeObject.defaultTitle + "'.");}
						var str_BadgeTitleValue = thisBadgeObject.defaultTitle;
					}
					else {
						if (varLogging.toUpperCase() == "TRUE") {console.log("Name value for '" + thisBadgeObject.navTitleSetting + "' is '" + str_BadgeTitleValue + "'.");}
					}
				// *************************************************************
					
				//There's only one row with our data.
				//data = data[0];
				var workItemCountData = fn_GetWorkItemCountsFromApiData(data, intStaleDays); //This could be multiple rows with one workitem per row, or one row with specific columns.
				//workItemCountData contains data.WorkItemCount, data.WorkItemsWithNoAssignedUserCount, data.StaleWorkItemCount;
				
				intWorkItemCount = workItemCountData.WorkItemCount;
				intStaleWorkItemCount = workItemCountData.StaleWorkItemCount;
				intWorkItemsWithNoAssignedUserCount = workItemCountData.WorkItemsWithNoAssignedUserCount;
				
				if (intWorkItemCount == null || intStaleWorkItemCount == null || intWorkItemsWithNoAssignedUserCount == null) {
					throw "The expected columns were not found for " + str_BadgeTitleValue;
				}
				
				var navTitle = str_BadgeTitleValue;
				//Add our CSS class to this nav node.
				var targetNavNode = $($('#side_nav li.nav_hover').find('span:contains("' + navTitle + '")')).parent(); //$('#side_nav li.nav_hover').find('span:contains("My Work")').parent();
				//targetNavNode should be an a tag.
				if (targetNavNode.length == 0) {
					throw "Found " + targetNavNode.length + " navigation nodes with name '" + navTitle + "'. Make sure the name of the navigation node matches what is in your environment. This value can be set in the admin settings.";
				}
				
				var thisMenuBadgeSpanRight = targetNavNode.find("span.menu-rightbadge");
				
				if (thisMenuBadgeSpanRight.length == 0) {
					targetNavNode.append('<span class="menu-badge menu-rightbadge"></span>');
					thisMenuBadgeSpanRight = targetNavNode.find("span.menu-rightbadge");
				}
				
				if (intWorkItemCount > 0) {
					thisMenuBadgeSpanRight.removeClass('no-badge');
					thisMenuBadgeSpanRight.text(intWorkItemCount);
				} else {
					thisMenuBadgeSpanRight.addClass('no-badge');
					thisMenuBadgeSpanRight.text('');
				}
				
				// Find the number of WI's in this view that have not been updated in 3 days, OR are unassigned (but not both.
				// Unassigned takes precedence over lastupdated.
				// NOTE: In future it would be good to get this value from a setting in the portal.
				
				// Show a second badge with a count of the WI's that are not updated in x days. If no WI's need updating in this view, hide the badge.
				var itemsThatNeedUpdatingOrAssignment = 0;
				
				//If we want to show both stale items and unassigned items, then unnassigned items wins with an orange counter.
				if(thisBadgeObject.blnShowUnassignedItems == true && thisBadgeObject.blnShowStaleItems == true && intWorkItemsWithNoAssignedUserCount > 0) {
					thisBadgeObject.blnShowStaleItems = false;
				}
				
				var strBadgeClass = "";
				if (thisBadgeObject.blnShowUnassignedItems == true && intWorkItemsWithNoAssignedUserCount > 0) {
					itemsThatNeedUpdatingOrAssignment = intWorkItemsWithNoAssignedUserCount;
					strBadgeClass = "menu-badgeunassigned";
				}
				else if (thisBadgeObject.blnShowStaleItems == true && intStaleWorkItemCount > 0) {
					itemsThatNeedUpdatingOrAssignment = intStaleWorkItemCount;
					strBadgeClass = "menu-badgestale";
				}
				
				if (itemsThatNeedUpdatingOrAssignment > 0) {
					var thisMenuBadgeSpanLeft = targetNavNode.find("span.menu-leftbadge");
					
					if (thisMenuBadgeSpanLeft.length == 0) {
						targetNavNode.append('<span class="menu-badge menu-leftbadge ' + strBadgeClass + '"></span>');
						thisMenuBadgeSpanLeft = targetNavNode.find("span.menu-leftbadge");
					}
					//var thisMenuBadgeSpanLeft = $('a[href="/View/cca5abda-6803-4833-accd-d59a43e2d2cf"] .menu-badgeunassigned');
				
					thisMenuBadgeSpanLeft.removeClass('no-badge');
					thisMenuBadgeSpanLeft.text(itemsThatNeedUpdatingOrAssignment);
				}
				/*else {
					thisMenuBadgeSpanLeft.addClass('no-badge');
					thisMenuBadgeSpanLeft.text('');
				}*/
			},
			failure: function (fn_BadgeTitleSettingFail){
					if (varLogging.toUpperCase() == "TRUE") {console.log("Fail");}
			}
		});
	}
	
	function fn_GetWorkItemCountsFromApiData(apiData, intStaleDays) {
		if (apiData == null)
			throw "The expected API data was null?";
		
		if (apiData.length == 1 && apiData[0].WorkItemCount != null) {
			return apiData[0];
			//This already contains our columns, WorkItemCount, WorkItemsWithNoAssignedUserCount, StaleWorkItemCount
		}
		
		var returnData = {WorkItemCount: 0, WorkItemsWithNoAssignedUserCount: 0, StaleWorkItemCount: 0};
		var datToday = new Date();
		var intXDaysAgo = datToday.setDate(datToday.getDate() -intStaleDays);
		var datDaysAgo = new Date(intXDaysAgo);
			
		//Calculate and do some stuff.
		var intWorkItemCount = apiData.length;
		var intStaleWorkItemCount = 0;
		var intWorkItemsWithNoAssignedUserCount = 0;
		
		//Get the stale work item count.
		for (var i = 0; i < apiData.length; i++) {
			if (Date.parse(apiData[i].LastModified) < datDaysAgo ) {
				intStaleWorkItemCount++;
			} 
		}
		
		//Get work items with no assigned user.
		for (var i = 0; i < apiData.length; i++) {
			// If the data returned has NO value in the AssignedUser property, add it to the unassigned variable.
			if (apiData[i].AssignedUser == null || apiData[i].AssignedUser == "") {
				intWorkItemsWithNoAssignedUserCount++;
			}
		}
		
		returnData.WorkItemCount = intWorkItemCount;
		returnData.StaleWorkItemCount = intStaleWorkItemCount;
		returnData.WorkItemsWithNoAssignedUserCount = intWorkItemsWithNoAssignedUserCount;
		
		return returnData;
	}
});
/* ------------------------------------------------------- */
/* -----------End Custom WorkItem Menu Badge ------------- */
/* ------------------------------------------------------- */

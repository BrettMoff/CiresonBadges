/* ------------------------------------------------------- */
/* -------------- Custom WorkItem Menu Badge ------------- */
/* ------------------------------------------------------- */
/*
v7.1.2016.1
Author: Martin Blomgren, Brian Wiest, Eric Brown, Brett Moffett, Joivan
Description: Adds a custom badge on the menu item counting all active work items. Refreshes every minute.

v1.1	Replace GetGridWorkItemsAll API call with GetDashboardDataById API call
v0.6 	Added comments through the code to make it easier to diagnose issues and expand
v0.5 	Added left and right badges to allow display of 2 counts on each view
v0.4 	Added badge to My Work view that shows number of Work Items that have not been updated in X days
v0.3 	Added Unassigned for Team Work
v0.2 	Fixed so badges loads on first pageload, added watch list & team requests,
		added setting to choose which badges to load, removed line when there is no items.
v0.1 	initial release


TO DO LIST:
- Replace GetGridWorkItemsMyRequests API call with GetDashboardDataById API call
- Replace GetGridWorkItemsMyGroups API call with GetDashboardDataById API call
- Replace GetGridWorkItemsByUser API call with GetDashboardDataById API call
- Replace GetGridWorkItemsAll API call with GetDashboardDataById API call
- Replace GetWatchListByUserId API call with GetDashboardDataById API call
*/
$(document).ready(function () {
	
	if (session.user.Analyst != 1 && session.user.IsAdmin != true) { 
		return;
	} 
	
	var guidDataSource_MyWork = '6DAF2352-3661-A776-47FB-9EE52BC47881';
	var guidDataSource_TeamWork = '';
	var guidDataSource_MyRequests = '';
	var guidDataSource_TeamRequests = '';
	var guidDataSource_ActiveWork = 'A1FDBF16-7A53-D471-4893-0CA219483B0F';
	var guidDataSource_WatchList = '';
	
	var dateBadgesStartDateTime = new Date(); //We don't want it to run forever, even after the page has timed out.
	
	//This section is used to observe the portal code loading and wait for the right pieces to load before continuing to execute.
	var badgeObserver = new MutationObserver(function (mutations) {
		var targetElement = $('#side_nav');
		if(targetElement.length > 0) {
			ApplyStyleSheetBadge(); // Add CSS
			createBadges(); // This will run on page load
			/*objBadgesIntervalTimerId = setInterval(function () {
				createBadges() // this will run after every 60 seconds
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
    function ApplyStyleSheetBadge() {
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
        addRule(".menu-badgeunassigned", {
            "background": "#E9001B",
            "background-image": "linear-gradient(to bottom, #FF0000, #8B0000)",
            "border": "1px solid #8B0000",
			"color": "white",
        });
		
		// Style that is common to Needs Updating badges
		addRule(".menu-badgeneedsupdating", {
            "background": "#E9001B",
            "background-image": "linear-gradient(to bottom, #ff9400, #8b5100)",
            "border": "1px solid #8b5100",
			"color": "white",
        });

		addRule(".no-badge", {
			"border": "none"
        });
    }
	
//*************************************************************************************************************************************************************************
	// Create menu-badges for each of the views.
	// These can be enabled and disabled by commenting out the badges not wanted. These are also controlled via Portal settings. 
	var createBadges = function() {
		
		//initialize our badge objects.
		var badgeObject_MyRequests = {navTitle: "My Requests", 
									  settingKey: "Badge-MyRequests", 
									  settingValue: null, 
									  apiString: "/api/V3/WorkItem/GetGridWorkItemsMyRequests?userId=" + session.user.Id + "&showInactiveItems=false",
									  blnShowUnassignedItems: false,
									  blnShowStaleItems: true,
									  };
		var badgeObject_MyWork = {navTitle: "My Work", 
								  settingKey: "Badge-MyWork", 
								  settingValue: null, 
								  apiString: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter" + "&queryId=" + guidDataSource_MyWork, 
								  blnShowUnassignedItems: false,
								  blnShowStaleItems: true
								  };
		var badgeObject_TeamWork = {navTitle: "Team Work", 
								  settingKey: "Badge-TeamWork", 
								  settingValue: null, 
								  apiString: "/api/V3/WorkItem/GetGridWorkItemsMyGroups?userId=" + session.user.Id + "&isScoped=false&showActivities=true&showInactiveItems=false",
								  blnShowUnassignedItems: true,
								  blnShowStaleItems: false
								  };
		var badgeObject_ActiveWork = {navTitle: "Active Work", 
								  settingKey: "Badge-ActiveWork", 
								  settingValue: null, 
								  apiString: "/api/v3/Dashboard/GetDashboardDataById/?dateFilterType=NoFilter" + "&queryId=" + guidDataSource_ActiveWork,
								  blnShowUnassignedItems: false,
								  blnShowStaleItems: true
								  };
		var badgeObject_TeamRequests = {navTitle: "Team Requests", 
								  settingKey: "Badge-TeamRequests", 
								  settingValue: null, 
								  apiString: "/api/V3/WorkItem/GetMyTeamRequest?userId=" + session.user.Id + "&showInactiveItems=false&isScoped=false",
								  blnShowUnassignedItems: false,
								  blnShowStaleItems: true
								  };
		var badgeObject_WatchList = {navTitle: "Watch List", 
								  settingKey: "Badge-WatchList", 
								  settingValue: null, 
								  apiString: "/api/V3/WorkItem/GetWatchListByUserId?userId=" + session.user.Id,
								  blnShowUnassignedItems: false,
								  blnShowStaleItems: false
								  };
		
		//Check settings and load badges if necessary.
		GetSettingsValueAndLoadBadges(badgeObject_MyWork);
		GetSettingsValueAndLoadBadges(badgeObject_TeamWork);
		GetSettingsValueAndLoadBadges(badgeObject_ActiveWork);
		GetSettingsValueAndLoadBadges(badgeObject_MyRequests);
		GetSettingsValueAndLoadBadges(badgeObject_TeamRequests);
		GetSettingsValueAndLoadBadges(badgeObject_WatchList);
	
	}
	
	//param thisBadgeObject contains:
	//	navTitle, the human-readable text that appears in the navigation node on the left. The badges will appear here.
	//	settingKey, like 'Badge-MyWork'
	//	apiString, Either a GetDashboardDataById call, or OOB call like GetGridWorkItemsMyRequests.
	//	blnShowUnassignedItems, decides if we show items that have no assigned user.
	//	blnShowStaleItems, decides if we show stale non-modified item badge on the left.
	function GetSettingsValueAndLoadBadges(thisBadgeObject) {
		$.ajax({
			url: "/api/V3/Settings/GetSetting?settingKey=" + thisBadgeObject.settingKey,
			type: "GET",
			async: true,
			success: function (settingData){
				//console.log(settingData);
				
				var settingDataValue = settingData.Value;
				if (settingData == null) {
					throw "The Setting for '" + thisBadgeObject.settingKey + "' was not found.";
				}
				else if (settingDataValue == null) {
					throw "Setting Setting value for '" + thisBadgeObject.settingKey + "' is null. Does it have a TRUE/FALSE value, and was the client session restarted?";
				}
				
				if (settingDataValue.toUpperCase() != "TRUE") {
					console.log("Badge setting for '" + thisBadgeObject.navTitle + "' is set to disabled. Ignoring.");
					return;
				}
				
				thisBadgeObject.settingValue = settingDataValue;
				$.ajax({
					url: thisBadgeObject.apiString,
					type: "GET",
					async: true,
					success: function (queryResults){
						thisBadgeObject.data = queryResults;
						try{
							ShowBadgesFromBadgeObject(thisBadgeObject);
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
							console.log("error occurred during ShowBadgesFromBadgeObject for '" + thisBadgeObject.navTitle + "'.");
							throw error;
						}
						
						
					}
				});
			}
		});
	}
	
	//param thisBadgeObject contains:
	//	navTitle, like "My Work". The human-readable text that appears in the navigation node on the left. The badges will appear here.
	//  settingKey, like 'Badge-MyWork';
	//  settingValue, like 'TRUE';
	//	dataSourceGuid for API Dashboard lookups.
	//	data, the returned work items from our dashboard query.
	//	blnShowUnassignedItems, decides if we show items that have no assigned user.
	//	blnShowStaleItems, decides if we show stales non-modified item badge on the left.
	function ShowBadgesFromBadgeObject(thisBadgeObject) {
		
		var data = thisBadgeObject.data;
		if (data.length == 0) {
			return;
		}
		//There's only one row with our data.
		//data = data[0];
		var workItemCountData = GetWorkItemCountsFromApiData(data); //This could be multiple rows with one workitem per row, or one row with specific columns.
		//workItemCountData contains data.WorkItemCount, data.WorkItemsWithNoAssignedUserCount, data.StaleWorkItemCount;
		
		intWorkItemCount = workItemCountData.WorkItemCount;
		intStaleWorkItemCount = workItemCountData.StaleWorkItemCount;
		intWorkItemsWithNoAssignedUserCount = workItemCountData.WorkItemsWithNoAssignedUserCount;
		
		//console.log(workItemCountData);
		
		if (intWorkItemCount == null || intStaleWorkItemCount == null || intWorkItemsWithNoAssignedUserCount == null) {
			throw "The expected columns were not found for " + thisBadgeObject.navTitle;
		}
		
		var navTitle = thisBadgeObject.navTitle;
		//Add our CSS class to this nav node.
		var targetNavNode = $($('#side_nav li.nav_hover').find('span:contains("' + navTitle + '")')).parent(); //$('#side_nav li.nav_hover').find('span:contains("My Work")').parent();
		//targetNavNode should be an a tag.
		if (targetNavNode.length == 0) {
			throw "Found " + targetNavNode.length + " navigation nodes with name '" + navTitle + "'.";
		}
		
		var thisMenuBadgeSpanRight = targetNavNode.find("span.menu-rightbadge");
		//console.log(thisMenuBadgeSpanRight);
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
		if (thisBadgeObject.blnShowUnassignedItems == true && intWorkItemsWithNoAssignedUserCount > 0) {
			itemsThatNeedUpdatingOrAssignment = intWorkItemsWithNoAssignedUserCount;
		}
		else if (thisBadgeObject.blnShowStaleItems == true && intStaleWorkItemCount > 0) {
			itemsThatNeedUpdatingOrAssignment = intStaleWorkItemCount;
		}
		
		if (itemsThatNeedUpdatingOrAssignment > 0) {
			var thisMenuBadgeSpanLeft = targetNavNode.find("span.menu-leftbadge");
			//console.log(thisMenuBadgeSpanLeft);
			if (thisMenuBadgeSpanLeft.length == 0) {
				targetNavNode.append('<span class="menu-badge menu-leftbadge menu-badgeunassigned"></span>');
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
		
	}
		
	function GetWorkItemCountsFromApiData(apiData) {
		if (apiData == null)
			throw "The expected API data was null?";
		
		if (apiData.length == 1 && apiData[0].WorkItemCount != null) {
			return apiData[0];
			//This already contains our columns, WorkItemCount, WorkItemsWithNoAssignedUserCount, StaleWorkItemCount
		}
		
		var returnData = {WorkItemCount: 0, WorkItemsWithNoAssignedUserCount: 0, StaleWorkItemCount: 0};
		
		var datToday = new Date();
		var intXDaysAgo = datToday.setDate(datToday.getDate() -3);
		var datDaysAgo = new Date(intXDaysAgo);
			
		//Calculate and do some stuff.
		var intWorkItemCount = apiData.length;
		var intStaleWorkItemCount = 0;
		var intWorkItemsWithNoAssignedUserCount = 0;
		
		//Get the stale workitem count.
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
	

})();
/* ------------------------------------------------------- */
/* -----------End Custom WorkItem Menu Badge ------------- */
/* ------------------------------------------------------- */

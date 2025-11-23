/* ------------------------------------------------------- */
/* -------------- Custom WorkItem Menu Badge ------------- */
/* ------------------------------------------------------- */
/*
Author: Martin Blomgren, Brian Wiest, Eric Brown, Brett Moffett, Joivan Hedrick
Description: Adds a custom badge on the menu item counting all active work items. Refreshes every minute.

v1.4.2  Remove reporting on mising navigation nodes.
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

	var varLogging = 'TRUE'
	if (varLogging) { console.log("Cireson Badges logging enabled"); }

	// SQL Data Sources that return the data needed for the solution.
	// List of all current Views (@NavNodeGUID) and their Grid UUID (@DataSourceGUID). 
	// Used for getting inactive data for WorkItemMenuBadge, under the navigation panel.
	badgeGridGUIDS = {
		"b5b894e7-a926-4f0f-b57b-b2a881bfaf62": "f712dd1c-c577-480e-9996-f3730189294a", // All desktop incidents
		"01cd0c6f-10a9-40e3-a12a-2e25fe861c80": "ce49a3e8-56dc-4313-8cfb-ccbd3793688a", // All Network Infinity
		"45c40656-c694-4d7d-b956-e89b82cbc74a": "a3d41b29-d84f-4290-8f04-4776748d5af3", // All Application Incidents
		"3f8a6695-2fa1-497d-b69f-d2fa7b320715": "6a131286-e4f8-47f8-aa82-a35002b3aacf", // All Murdoch Incidents
		"e3fafdaf-edef-4aff-a7c4-2a29cc19e3e0": "af986300-d2db-47cd-bfe2-858def2f8840", // All SOUTH Campus Incidents
		"318f6f2a-fe26-40eb-acfd-953ea6d969bb": "0743614c-6f78-45d4-96f8-94a0566f0247", // All EAST Campus Incidents
		"6c18110f-1860-477c-868e-1992b53a0cce": "5d8a51c5-b6f3-4a36-ae4a-0554f422a363", // ICT Stagnant Work Items
		"49975920-cd70-4e5b-b312-58a16e376a2f": "b38adc3a-12c7-4798-aa9d-e9ef37c4dcc6", // ICT Cybersecurity Work Items
		"5f47e62a-0284-465a-893f-3df4b7eb908e": "96fb7e88-10ce-4104-98e0-daa66095f508", // All Purchasing Requests
		"05027dfc-1e19-4dd0-b03c-966914824492": "7736203f-5aa3-49c8-b871-edaa54d79a02", // All Software Evaluation Requests
		"cca5abda-6803-4833-accd-d59a43e2d2cf": "6DAF2352-3661-A776-47FB-9EE52BC47881", // My work
		"f94d43eb-eb42-4957-8c48-95b9b903c631": "AFD60BBA-4648-4110-B6C2-0FF233D4587F", // Team Work
		"c5161e06-2378-4b44-aa89-5600e2d3b9d8": "4876b613-fa75-421b-9345-8c570821b55e", // My Requests
		"62f452d5-66b5-429b-b2b1-b32d5562092b": "A1FDBF16-7A53-D471-4893-0CA219483B0F"  // Active Work
		// '"e6dc7f3f-5836-4166-b5e5-b25932c23e6c":"34ff8da3-b308-4799-aa8b-72e0186086d3"', // Closed Incidents
		// '"629276df-aeab-4a1d-8c03-440db928e6b4":"c16898c6-1d9c-4789-9609-b2187dd943a4"' // All Open Incidents
	}
	var intStaleDays = 5
	const const_CSSFileName = "/CustomSpace/WorkItem/WorkItemMenuBadge.css"		// Custom CSS file to change look and feel on the new home page
	var dateBadgesStartDateTime = new Date(); //We don't want it to run forever, even after the page has timed out.

	// *************************************************************************************************************
	// ***************** Wait for Side_Nav to load the style of the badges as they appear on screen.****************
	// ********************************* EVENT: Trigger after every Ajax Complete event ****************************
	// *************************************************************************************************************
	var filterHookFunction = function () {                                          // Declare our function before we bind it to our ajax complete event. Important.
		if (varLogging) { console.log("Ajax complete count - checking for side_nav element...") };
		var sideNavigationMenuElement = $('#side_nav')                           	// Get the nav object
		if (sideNavigationMenuElement.length > 0) {                                 //Check for the Nav Sidebar. If it exists then unbind this function and add the filter.
			$(document).unbind("ajaxComplete", filterHookFunction);
			if (varLogging) { console.log("side_nav element found. Loading CSS.") };
			fn_loadCustomCss();		 												// Add CSS rules in anticipation of loading the badges successfully
			fn_createBadgeVariables(); 												// This will run on page load and create empty variables for each badge, then load the badge but only if enabled in settings
		}
	}
	$(document).bind("ajaxComplete", filterHookFunction);                           // Bind our function to the ajax complete event.

	// *************************************************************************************************************
	// ************************** Define the style of the badges as they appear on screen.**************************
	// *************************************************************************************************************
	function fn_loadCustomCss() {
		if (varLogging) { console.log("Loading custom css") };
		var fileref = document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", const_CSSFileName);//"/CustomSpace/WorkItem/WorkItemMenuBadge.css");
		fetch(const_CSSFileName, { method: 'HEAD' })																			// Check if the CSS file exists by making a HEAD request
			.then(response => {
				if (response.ok) {																								// If the response is ok (status 200-299)
					if (varLogging) { console.log("Custom CSS file found, loading...") };
					document.getElementsByTagName("head")[0].appendChild(fileref);												// Append the CSS file to the head of the document
					if (varLogging) { console.log("Custom CSS file loaded successfully!") };
				} 
				else {
					console.warn("Custom CSS file " + const_CSSFileName + " not found (Status: " + response.status + ")");		// Warn if the CSS file is not found
				}
			})
			.catch(error => {
				console.warn("Failed to check CSS file existence:", error); 													// Warn if there was an error checking the CSS file
			});
	}

	// *************************************************************************************************************
	// ************************************** fn_createBadgeVariables **********************************************
	// *************************************************************************************************************
	// Create menu-badges varibale for each of the views ready to be used but not filled with data.
	// These can be enabled and disabled by commenting out the badges not wanted. 
	// These are also controlled via Portal settings. 
	//**************************************************************************************************************
	var fn_createBadgeVariables = function () {
		if (varLogging) { console.log("Creating Badge Variables")}
		// Find all views currently on screen.
		$($("#side_nav > ul > li.nav_active.mark_sidenav.nav_trigger > div > div").find("li > a")).each(function () {
			var viewID = $(this).attr("data-definition");
			var viewLabel = $(this).text();
			if (varLogging) { console.log("Processing " + viewLabel + " (" + viewID + ")"); }
			if (badgeGridGUIDS[viewID] == null) {																			// Look for the view GUID in the badgeGridGUIDs Array
				console.log(viewLabel + " (" + viewID + ") does not exist in ICT Grid UUIDs. Either add to list or ignore this message.")
			}
			else {
				var badgeObject = {
					viewID: viewID,
					viewLabel: viewLabel,
					badgeDataSource: badgeGridGUIDS[viewID],
					queryAllWorkItems: "/api/v3/Dashboard/GetDashboardDataById/?queryId=" + badgeGridGUIDS[viewID],
					blnShowUnassignedItems: true,
					blnShowStaleItems: true
				};
				if (varLogging) { console.log("'" + viewID + "' exists in badgeGrid UUIDs. Loading Values." + badgeGridGUIDS[viewID]); }
				fn_getSettingsValueAndLoadBadges(badgeObject, intStaleDays)
			}
		})
	}
	function fn_getSettingsValueAndLoadBadges(thisBadgeObject, intStaleDays) {
		// ********** Get API Query Results ***************
		$.ajax({
			url: thisBadgeObject.queryAllWorkItems,
			type: "GET",
			async: true,
			success: function (queryResults) {
				thisBadgeObject.data = queryResults;
				try {
					if (varLogging) {console.log("Running query: " + thisBadgeObject.queryAllWorkItems);}
					fn_ShowBadgesFromBadgeObject(thisBadgeObject, intStaleDays);
					var dateNow = new Date();
					var dateTwoHoursAgo = dateNow.setHours(dateNow.getHours() - 2);
					dateTwoHoursAgo = new Date(dateTwoHoursAgo);

					if (dateBadgesStartDateTime > dateTwoHoursAgo) {
						setTimeout(function () { fn_getSettingsValueAndLoadBadges(thisBadgeObject) }, 60000); //Re-run this same parent method every 60 seconds, assuming it didn't crash or something.
					}
					else {
						console.log("Exiting Badges script after page inactivity.");
						return;
					}
				}
				catch (error) {
					console.log("Error occurred during fn_ShowBadgesFromBadgeObject for '" + thisBadgeObject.viewLabel + "'.");
					throw error;
				}
			}
		});
		// *************************************************************
	}
	// *************************************************************************************************************
	// ***************************************** SHow Badges on the views.******************************************
	// *************************************************************************************************************
	function fn_ShowBadgesFromBadgeObject(thisBadgeObject, intStaleDays) {

		var data = thisBadgeObject.data;
		if (data.length == 0) {
			if (varLogging) {console.log("View '"+ thisBadgeObject.viewLabel + "' returned no results.");}
			return;
		}
		if (varLogging) {console.log("Trying to load counts for " + thisBadgeObject.viewLabel);}
		var workItemCountData = fn_GetWorkItemCountsFromApiData(data, intStaleDays); //This could be multiple rows with one workitem per row, or one row with specific columns.
		intWorkItemCount = workItemCountData.WorkItemCount;
		intStaleWorkItemCount = workItemCountData.StaleWorkItemCount;
		intWorkItemsWithNoAssignedUserCount = workItemCountData.WorkItemsWithNoAssignedUserCount;

		if (intWorkItemCount == null || intStaleWorkItemCount == null || intWorkItemsWithNoAssignedUserCount == null) {
			throw "The expected columns were not found for " + str_BadgeTitleValue;
		}

		// Add our CSS class to this nav node.
		//	var matchingViewListElements = $($('#side_nav li.nav_hover').find('span:contains("' + navTitle + '")')); 
		if (varLogging) {console.log("Looking for span that contains " + thisBadgeObject.viewLabel)}
		const matchingViewListElements = Array.from(document.querySelectorAll('#side_nav * li')).filter(el => el.textContent.trim() === thisBadgeObject.viewLabel);
		
		//var matchingViewListElements = $($('#side_nav li.nav_hover').find('span:contains("' + thisBadgeObject.viewLabel + '")')).parent(); //$('#side_nav li.nav_hover').find('span:contains("My Work")').parent();

		//matchingViewListElements should be an a tag.
		if (matchingViewListElements == 0) {
			if (varLogging) {throw "Found " + matchingViewListElements.length + " navigation nodes with name '" + thisBadgeObject.viewLabel + "'.";}
		}
		console.log("Found " + matchingViewListElements.length + " navigation nodes with name '" + thisBadgeObject.viewLabel + "'.")
		var targetViewElement = matchingViewListElements[0]
		var thisMenuBadgeSpanRight = targetViewElement.parentElement.querySelector("span.menu-rightbadge");
		console.log("Found rightbadge element for " + thisMenuBadgeSpanRight)
		if (thisMenuBadgeSpanRight.length == 0) {
			matchingViewListElements.append('<span class="menu-badge menu-rightbadge"></span>');
			thisMenuBadgeSpanRight = matchingViewListElements.find("span.menu-rightbadge");
		}

		if (intWorkItemCount > 0) {
			thisMenuBadgeSpanRight.removeClass('no-badge');
			thisMenuBadgeSpanRight.text(intWorkItemCount);
		} else {
			thisMenuBadgeSpanRight.addClass('no-badge');
			thisMenuBadgeSpanRight.text('');
		}
		//console.log(thisMenuBadgeSpanRight);
		// Find the number of WI's in this view that have not been updated in 3 days, OR are unassigned (but not both.
		// Unassigned takes precedence over lastupdated.
		// NOTE: In future it would be good to get this value from a setting in the portal.

		// Show a second badge with a count of the WI's that are not updated in x days. If no WI's need updating in this view, hide the badge.
		var itemsThatNeedUpdatingOrAssignment = 0;

		//	If we want to show both stale items and unassigned items, then unnassigned items wins with an orange counter.
		//	if(thisBadgeObject.blnShowUnassignedItems == true && thisBadgeObject.blnShowStaleItems == true && intWorkItemsWithNoAssignedUserCount > 0) {
		//		thisBadgeObject.blnShowStaleItems = false;
		//}
		/****************************************************************** Replace with portal setting value here ***************************************************/
		// SMTAFE - prefer Stale Items to win out to changing to suit.
		if (thisBadgeObject.blnShowUnassignedItems == true && thisBadgeObject.blnShowStaleItems == true && intStaleWorkItemCount > 0) {
			thisBadgeObject.blnShowUnassignedItems = false;
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
			var thisMenuBadgeSpanLeft = matchingViewListElements.find("span.menu-leftbadge");

			if (thisMenuBadgeSpanLeft.length == 0) {
				matchingViewListElements.append('<span class="menu-badge menu-leftbadge ' + strBadgeClass + '"></span>');
				thisMenuBadgeSpanLeft = matchingViewListElements.find("span.menu-leftbadge");
			}
		
			thisMenuBadgeSpanLeft.removeClass('no-badge');
			thisMenuBadgeSpanLeft.text(itemsThatNeedUpdatingOrAssignment);
		}
	}

	function fn_GetWorkItemCountsFromApiData(apiData, intStaleDays) {
		if (apiData == null)
			throw "The expected API data was null?";

		if (apiData.length == 1 && apiData[0].WorkItemCount != null) {
			return apiData[0];
			//This already contains our columns, WorkItemCount, WorkItemsWithNoAssignedUserCount, StaleWorkItemCount
		}

		var returnData = { WorkItemCount: 0, WorkItemsWithNoAssignedUserCount: 0, StaleWorkItemCount: 0 };
		var datToday = new Date();
		var intXDaysAgo = datToday.setDate(datToday.getDate() - intStaleDays);
		var datDaysAgo = new Date(intXDaysAgo);

		//Calculate and do some stuff.
		var intWorkItemCount = apiData.length;
		var intStaleWorkItemCount = 0;
		var intWorkItemsWithNoAssignedUserCount = 0;

		//Get the stale work item count.
		if (varLogging) {console.log("Getting Stale Work Item count.");}
		for (var i = 0; i < apiData.length; i++) {
			if (Date.parse(apiData[i].LastModified) < datDaysAgo) {
				intStaleWorkItemCount++;
			}
		}

		//Get work items with no assigned user.
		if (varLogging) {console.log("Getting Unassigned Work Item count.");}
		for (var i = 0; i < apiData.length; i++) {
			// If the data returned has NO value in the AssignedUser property, add it to the unassigned variable.
			if (apiData[i].AssignedUser == null || apiData[i].AssignedUser == "") {
				intWorkItemsWithNoAssignedUserCount++;
			}
		}
		if (varLogging) {console.log("WI: " + intWorkItemCount + " | Stale: " + intStaleWorkItemCount + " | Unassigned: " + intWorkItemsWithNoAssignedUserCount + ".");}
		returnData.WorkItemCount = intWorkItemCount;
		returnData.StaleWorkItemCount = intStaleWorkItemCount;
		returnData.WorkItemsWithNoAssignedUserCount = intWorkItemsWithNoAssignedUserCount;

		return returnData;
	}
})
/* ------------------------------------------------------- */
/* -----------End Custom WorkItem Menu Badge ------------- */
/* ------------------------------------------------------- */

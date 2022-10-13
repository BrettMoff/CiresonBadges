--Create_BadgesActiveWorkQuery.sql
--use a GUID generator to create some new guids for your view panel and navigation node. Powershell syntax [GUID]::NewGuid()
DECLARE @DataSourceGuid uniqueidentifier			= '4876b613-fa75-421b-9345-8c570821b55e'

-- set the query title
DECLARE @QueryTitle nvarchar(255)  					= 'My Requests'

--Create the datasource query.
DECLARE @Query nvarchar(max) = '
/* Badges My Requests */
WITH cte_MyRequests (WorkItemId, IsNoAssignedUser, IsStaleWorkItem)  
AS
(
	SELECT 
		WorkItem.WorkItemId
		,IIF(AssignedUser is null, 1, null) as IsNoAssignedUser
		,IIF(WorkItem.LastModified < GETUTCDATE()-3, 1, null) as IsStaleWorkItem
	FROM ServiceManagement.dbo.WorkItem

	inner join ServiceManagement.dbo.DisplayString as DisplayStringStatus 
		on DisplayStringStatus.ElementID = WorkItem.StatusId
		and DisplayStringStatus.LocaleID = ''ENU''
		and DisplayStringStatus.DisplayString not in (''Resolved'', ''Closed'', ''Completed'', ''Failed'', ''Skipped'', ''Cancelled'')

	WHERE WorkItem.ClassId not in (''7AC62BD4-8FCE-A150-3B40-16A39A61383D'', ''BFD90AAA-80DD-0FBB-6EAF-65D92C1D8E36'') --dont include activities
	AND (
		WorkItem.AffectedUserId = @UserId 
		OR ( WorkItem.AffectedUserId is null AND  WorkItem.CreatedByUserId = @UserId )
	)
)

select 
	COUNT(cte_MyRequests.WorkItemId) as WorkItemCount
	,COUNT(cte_MyRequests.IsNoAssignedUser) as WorkItemsWithNoAssignedUserCount
	,COUNT(IsStaleWorkItem) as StaleWorkItemCount
	
from cte_MyRequests
';

DELETE FROM [ServiceManagement].[dbo].[DataSource] where DataSource.Id = @DataSourceGuid;
INSERT INTO [ServiceManagement].[dbo].[DataSource] (Id, Title, ConnectionString, Query)
VALUES (@DataSourceGuid, 'Badges - ' + @QueryTitle, NULL, @Query);
--end


# TODO (Create Group - Full Chat)

## Goal
Implement fully working group chat: users create a group from the UI, it appears in the sidebar, and all selected users can chat in that group.

## Frontend tasks
1. Update `src/components/ChatSidebar.jsx`
   - On submit, call backend endpoint to create group.
   - Receive created group and update `chats` state so it appears immediately.
   - Fix label spelling (optional UI polish): “Creat Group” -> “Create Group”.
2. Update `src/App.jsx`
   - Extend sidebar data to include group chats.
   - Update message fetching so that `ChatWindow` can render group messages.

## Backend tasks
3. Add `Group` model (`backend/models/Group.js`)
   - group name
   - members (array of user ids)
   - createdBy
4. Add endpoints in `backend/routes/groups.js`
   - `POST /api/groups` create group from frontend (groupName, memberIds)
   - `GET /api/groups/my` list groups for current user with last message + unread count
   - `GET /api/groups/:groupId/messages` list messages
5. Extend existing `Message` model to support group messaging
   - Either: add `groupId` and make `receiver` optional
6. Update socket logic (`backend/socket.js`)
   - Emit/receive group messages to all group members.
   - Implement `markAsRead` for group chats.
   - Add typing events for group chats.

## Testing
7. Run backend and frontend, verify:
   - Create group appears in sidebar immediately.
   - Clicking group opens chat window.
   - Messages sent by any member show for all members.
   - Unread counts update.


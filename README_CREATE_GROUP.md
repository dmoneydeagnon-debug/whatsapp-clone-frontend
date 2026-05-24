# Create Group (Frontend)

## What works now
- `src/components/ChatSidebar.jsx` has a **Create Group** option in the three-dot menu.
- Clicking it opens a modal:
  - enter **Group name**
  - select users (multi-select from existing `chats`)
- On submit it logs:
  - `console.log('Create Group:', { groupName, selectedUserIds })`

## Why the group is not shown in the sidebar yet
- Current frontend chat list (`chats`) is loaded from backend endpoint:
  - `GET /api/auth/users`
- There is no backend/API for groups yet.
- Also, the frontend chat shape is built around 1:1 chats (receiver id), so rendering a new group item requires either:
  - a temporary local UI insert (mock group chat) or
  - a backend change to return group chats.

## Next steps options
1) Temporary UI-only approach (no backend):
   - After submit, insert a mock chat item into `chats` with:
     - `_id` = synthetic id (e.g. `group_${Date.now()}`)
     - `name` = group name
     - `lastMessage` = ''
     - `unreadCount` = 0
   - Needs `App.jsx` to accept a callback from `ChatSidebar`.

2) Proper backend implementation:
   - Add Group model/table
   - Add endpoints to create group + list group chats
   - Update socket logic for group messaging


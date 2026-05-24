# TODO - Create Group in 3-dot menu

## Plan Summary
- Add a new menu option in `src/components/ChatSidebar.jsx` under the existing three-dot menu: **Create Group** (fix label typo: “Creat Group” -> “Create Group”).
- When clicked: open a modal (React state only) to:
  1) Enter group name
  2) Select multiple users from existing `chats` list
  3) On submit: `console.log({ groupName, selectedUserIds })` (no backend yet)
- Ensure existing menu options still work and code won’t break.

## Steps
1. Update `ChatSidebar.jsx` to accept a new prop `onCreateGroupClick` (or inline modal).
2. Implement the Create Group modal UI and state inside `ChatSidebar.jsx` (preferred to avoid wiring from `App.jsx`).
3. Ensure clicking “Create Group” closes the three-dot menu and opens the modal.
4. Implement multi-select list using checkboxes/buttons using `chats` data.
5. On submit: validate group name + at least one selected user, then log to console and close modal.
6. Ensure cancel/close works and selection resets appropriately.
7. Run/verify build (optional): `npm test` / `npm run build` / `npm run dev`.


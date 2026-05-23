# TODO - Message Reactions (Emoji)

- [x] Backend: Extend Message schema with reactions field.
- [x] Backend: Add socket handler `addReaction` and emit `messageReaction` to both participants.



- [ ] Frontend: Add emoji picker UI to message bubbles (right-click desktop, long-press mobile).

- [ ] Frontend: Render reactions per message (grouped by emoji with counts).
- [ ] Frontend: Emit `addReaction` on emoji select and update local state on `messageReaction`.
- [ ] Manual test: react to messages with 2 users/devices, verify persistence after refresh.


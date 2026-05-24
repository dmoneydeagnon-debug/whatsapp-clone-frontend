# TODO

- [ ] Add Loader3D component file (done)
- [ ] Add an app-level “initializing” state in `src/App.jsx` to show Loader3D
- [ ] During token-based auth check, show Loader3D until `GET /api/auth/me` resolves
- [ ] During socket.io connection (after auth success), show Loader3D until socket `connect` fires (or timeout)
- [ ] Keep existing AuthForm behavior for manual login/register
- [ ] Ensure loader is removed before rendering chat UI
- [ ] Quick run/test: `npm run dev` and verify loader appears during auth + socket init


export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.COQoqkJz.js",app:"_app/immutable/entry/app.CsFWFL0q.js",imports:["_app/immutable/entry/start.COQoqkJz.js","_app/immutable/chunks/D8bZ0CFb.js","_app/immutable/chunks/CkllqTU3.js","_app/immutable/chunks/CVi_GoY_.js","_app/immutable/entry/app.CsFWFL0q.js","_app/immutable/chunks/CVi_GoY_.js","_app/immutable/chunks/CkllqTU3.js","_app/immutable/chunks/DsnmJJEf.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

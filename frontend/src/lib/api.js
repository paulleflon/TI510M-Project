const api = {
	get: async (endpoint, query) => {
		const url = new URL(import.meta.env.VITE_API_URL + endpoint);
		if (query) {
			Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
		}
		const response = await fetch(url);
		return response.json();
	},
	post: async (endpoint, body) => {
		const response = await fetch({
			url: import.meta.env.VITE_API_URL,
			pathname: endpoint,
			method: 'POST',
			body: JSON.stringify(body)
		});
		return response.json();
	},

	public: {
		get(endpoint, query) {
			return api.get('/api/public' + endpoint, query);
		},
		post(endpoint, body) {
			return api.post('/api/public' + endpoint, body);
		}
	}
};

export default api;
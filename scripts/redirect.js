
// Redirect
// ––––––––––––––––––––––––––––––––––––––––––––––––––

(() => {

	'use strict';

	if (window.location.port === '3000') return;

	const url = 'https://github.com/cjpatoilo/initify';
	const delay = 2000;

	setTimeout(() => window.location = url, delay);

})();

import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import {auth} from './auth';
import {modal} from './modal';
import {i18n} from './i18n';

export default (history) =>
	combineReducers({
		router: connectRouter(history),
		auth,
		modal,
		i18n
	});
import deviceInfo from './utils/deviceInfo';
import run from './plugins/run';

import testvue from '../../components/testvue/testvue';

deviceInfo();
run('.js-testvue', testvue);

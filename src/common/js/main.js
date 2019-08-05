import run from './plugins/run';

import testvue from '../../components/testvue/testvue';
import deviceinfo from '../../components/deviceinfo/deviceinfo';

run('.js-testvue', testvue);
run('.info-detail', deviceinfo);

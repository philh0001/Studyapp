import first from '../../../content/course/assessments/01-modules.json';
import second from '../../../content/course/assessments/02-modules.json';
import third from '../../../content/course/assessments/03-modules.json';
import fourth from '../../../content/course/assessments/04-modules.json';
import type {ModuleAssessmentPack} from './assessment-types';

export const moduleAssessments=[...first,...second,...third,...fourth] as ModuleAssessmentPack[];

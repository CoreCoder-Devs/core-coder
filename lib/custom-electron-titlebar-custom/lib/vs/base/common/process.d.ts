import { IProcessEnvironment } from 'vs/base/common/platform';
export declare const cwd: () => string;
export declare const env: IProcessEnvironment;
export declare const platform: string;
export declare const nextTick: (callback: (...args: any[]) => void) => void;

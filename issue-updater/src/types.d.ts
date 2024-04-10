export interface JunitJsonFile {
    disabled: number;
    errors: number;
    name: string;
    failures: number;
    tests: number;
    time: number;
    testsuite: Testsuite[];
}

export interface Testsuite {
    disabled: number;
    errors: number;
    failures: number;
    name: string;
    skipped: number;
    tests: number;
    time: number;
    properties?: Property[];
    testcase: Testcase[];
}

export interface Property {
    name: string;
    value: string;
}

export interface Testcase {
    name: string;
    classname: string;
    file: string;
    failure?: Failure[];
    skipped?: Skipped[];
}

export interface Failure {
    inner: string;
    type: string;
    message: string;
}

export interface Skipped {
    type: string;
    message: string;
}

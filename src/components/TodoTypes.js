// @flow

export type TDLIData = {
    done: boolean,
    desc: string,
};

export type TodoData = {
    tdId: string,
    tdTitle: string,
    tdColor: string,
    tdliData: {[key: string]: TDLIData},  // key = tdli database key
};

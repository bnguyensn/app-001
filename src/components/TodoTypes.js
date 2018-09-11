// @flow

export type TDLIData = {
    done: boolean,
    desc: string,
};

export type TodoData = {
    tdId: string,
    tdTitle: string,
    tdColor: string,
    tdliIds: string[],  // Need this to ensure tdlis are in the correct order
    tdliData: {[key: string]: TDLIData},  // key = tdli database key
};

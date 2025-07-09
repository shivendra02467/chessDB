const state = {
    depth: 0,
    lines: [],
    bestMove: ''
};

let listeners = [];

export const getState = () => JSON.parse(JSON.stringify(state));

export const subscribe = fn => {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
};

const emit = () => { listeners.forEach(fn => fn()); };

export const reset = fen => {
    state.depth = 0;
    state.lines = [];
    state.bestMove = '';
    emit();
};

export const commitLine = parsed => {
    const { depth, k, score, pvUci } = parsed;
    if (depth < state.depth) return;

    if (depth > state.depth) {
        state.depth = depth;
        state.lines = [];
    }

    state.lines[k - 1] = { score, pvUci };
    if (k === 1) state.bestMove = pvUci.split(' ')[0];
    emit();
};

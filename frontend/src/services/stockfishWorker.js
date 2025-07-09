// export const analyzeGame = async (userId, fen) => {
//     const response = await fetch("/api/stockfish", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, fen }),
//     });
//     return response.json();
// };
const ENGINE_COUNT = 3;
let engines = [];
let current = 0;

export function initEnginePool() {
    for (let i = 0; i < ENGINE_COUNT; i++) {
        const sf = new Worker('/stockfish-nnue-16.js', { type: 'module' });
        sf.postMessage('uci');
        sf.postMessage('setoption name Use NNUE value true');
        sf.postMessage('setoption name MultiPV value 3');
        engines.push(sf);
    }
}

export function getNextEngine() {
    const e = engines[current];
    current = (current + 1) % ENGINE_COUNT;
    return e;
}

export function cleanupEngines() {
    for (const sf of engines) {
        sf.terminate();
    }
    engines = [];
    current = 0;
}

let activeRequests = 0;   // 상단 바를 실제로 보여줄지 결정하는 카운터
let skipRequests = 0;     // 바에는 안 띄우지만, 화면 표시 타이밍(waitForIdle)엔 여전히 포함시킬 요청
// 카운터가 0으로 떨어진 뒤에도 "상단 바가 아직 화면에 떠서 사라지는 중"인 동안 true로 유지되는 값.
// waitForIdle()이 카운터 스냅샷 대신 이 값을 보고 판단해야, 요청이 막 끝난 직후(카운터는 이미 0)에도
// 바 애니메이션이 끝날 때까지 제대로 기다리고, 애초에 요청이 없었던 경우엔 즉시 통과시킬 수 있다.
let barVisible = false;
let hideTimer = null;
const listeners = new Set();
const FADE_MS = 300;

const isIdle = () => activeRequests === 0 && skipRequests === 0 && !barVisible;
const notify = () => listeners.forEach(listener => listener(activeRequests));

export const loadingBar = {
    // skip: true면 상단 바에는 표시하지 않되, waitForIdle()로는 여전히 기다려짐
    // (자기만의 로컬 로딩 표시가 있는 컴포넌트가, 다른 컴포넌트와 화면 표시 타이밍은 계속 맞추고 싶을 때 사용)
    start({ skip = false } = {}) {
        if (skip) {
            skipRequests += 1;
            notify();
            return;
        }

        activeRequests += 1;
        clearTimeout(hideTimer);
        barVisible = true;
        notify();
    },
    done({ skip = false } = {}) {
        if (skip) {
            skipRequests = Math.max(0, skipRequests - 1);
            notify();
            return;
        }

        activeRequests = Math.max(0, activeRequests - 1);
        notify();

        if (activeRequests === 0) {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                barVisible = false;
                notify();
            }, FADE_MS);
        }
    },
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    // 기다릴 요청(바에 뜨는 것이든 skip이든)이 하나도 없었으면 즉시 resolve(괜한 깜빡임 방지).
    // 요청이 있었다면, 다 끝나고(skip 포함) 상단 바가 화면에서 완전히 사라질 때까지 기다렸다가 resolve.
    waitForIdle() {
        return new Promise(resolve => {
            if (isIdle()) {
                resolve();
                return;
            }
            const unsubscribe = loadingBar.subscribe(() => {
                if (isIdle()) {
                    unsubscribe();
                    resolve();
                }
            });
        });
    },
};

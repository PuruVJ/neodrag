import { $DEVCOMP, createMemo, untrack, createSignal } from 'solid-js';

function createProxy(source) {
    return new Proxy(function hmrCompWrapper(props, ...rest) {
        const s = source();
        if (!s || $DEVCOMP in s) {
            return createMemo(() => {
                const c = source();
                if (c) {
                    return untrack(() => c(props));
                }
                return undefined;
            });
        }
        // no $DEVCOMP means it did not go through devComponent so source() is a regular function, not a component
        return s.call(this, props, ...rest);
    }, {
        get(_, property) {
            return source()[property];
        },
        set(_, property, value) {
            source()[property] = value;
            return true;
        },
    });
}

function isListUpdated(a, b) {
    if (a == null && b != null) {
        return true;
    }
    if (a != null && b == null) {
        return true;
    }
    if (a && b) {
        if (a.length !== b.length) {
            return true;
        }
        for (let i = 0, len = a.length; i < len; i++) {
            if (!Object.is(a[i], b[i])) {
                return true;
            }
        }
    }
    return false;
}

function hot$1({ component: Comp, id, signature, dependencies }, hot) {
    if (hot) {
        const [comp, setComp] = createSignal(Comp);
        const prev = hot.data;
        // Check if there's previous data
        if (prev && prev[id]) {
            // Check if there's a new signature and dependency
            // This is always new in standard HMR
            if (signature && dependencies) {
                // Check if signature changed
                // or dependencies changed
                if (prev[id].signature !== signature
                    || isListUpdated(prev[id].dependencies, dependencies)) {
                    // Remount
                    prev[id].dependencies = dependencies;
                    prev[id].signature = signature;
                    prev[id].setComp(() => Comp);
                }
            }
            else {
                prev[id].setComp(() => Comp);
            }
        }
        hot.dispose(data => {
            data[id] = prev ? prev[id] : {
                setComp,
                signature,
                dependencies,
            };
        });
        hot.accept();
        return createProxy(comp);
    }
    return Comp;
}

function hot({ component: Comp, id, signature, dependencies }, isHot) {
    let Component = Comp;
    function handler(newModule) {
        const registration = newModule.$$registrations[id];
        if (!registration) {
            // For some reason, the registration was lost, invalidate
            return true;
        }
        registration.component.setComp = Comp.setComp;
        registration.component.signature = Comp.signature;
        registration.component.dependencies = Comp.dependencies;
        // Check if incoming module has signature
        if (registration.signature && registration.dependencies) {
            // Compare old signature and dependencies
            if (registration.signature !== Comp.signature
                || isListUpdated(registration.dependencies, Comp.dependencies)) {
                // Remount
                Comp.dependencies = registration.dependencies;
                Comp.signature = registration.signature;
                Comp.setComp(() => registration.component);
            }
        }
        else {
            // No granular update, remount
            Comp.setComp(() => registration.component);
        }
        registration.component.signature = Comp.signature;
        registration.component.dependencies = Comp.dependencies;
        return false;
    }
    if (isHot) {
        const [comp, setComp] = createSignal(Comp);
        Comp.setComp = setComp;
        Comp.dependencies = dependencies;
        Comp.signature = signature;
        Component = createProxy(comp);
    }
    return { Component, handler };
}

export { hot as esm, hot$1 as standard };

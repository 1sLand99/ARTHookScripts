
import { InstrumentationEvent, InstrumentationListenerJsProxImpl } from "../implements/10/art/Instrumentation/InstrumentationListener"
import { SwitchImplContext } from "../implements/10/art/interpreter/SwitchImplContext"
import { Instrumentation } from "../implements/10/art/Instrumentation/Instrumentation"
import { interpreter } from "../implements/10/art/interpreter/interpreter"
import { ArtMethod } from "../implements/10/art/mirror/ArtMethod"
import { ArtThread } from "../implements/10/art/Thread"
import { ObjPtr } from "../implements/10/art/ObjPtr"
import { KeyValueStore } from "../../tools/common"
import { getSym } from "../Utils/SymHelper"

// https://cs.android.com/android/platform/superproject/+/android-10.0.0_r47:art/runtime/interpreter/interpreter_switch_impl-inl.h;l=2625
export class ExecuteSwitchImplCppManager {

    private constructor() { }

    // void art::interpreter::ExecuteSwitchImplCpp<true, false>(art::interpreter::SwitchImplContext*)
    // _ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb0EEEvPNS0_17SwitchImplContextE
    private static get execute_switch_impl_cpp_1_0() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb0EEEvPNS0_17SwitchImplContextE", "libart.so")!
    }

    // void art::interpreter::ExecuteSwitchImplCpp<false, true>(art::interpreter::SwitchImplContext*)
    // _ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb1EEEvPNS0_17SwitchImplContextE
    private static get execute_switch_impl_cpp_0_1() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb1EEEvPNS0_17SwitchImplContextE", "libart.so")!
    }

    // void art::interpreter::ExecuteSwitchImplCpp<true, true>(art::interpreter::SwitchImplContext*)
    // _ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb1EEEvPNS0_17SwitchImplContextE
    private static get execute_switch_impl_cpp_1_1() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb1ELb1EEEvPNS0_17SwitchImplContextE", "libart.so")!
    }

    // void art::interpreter::ExecuteSwitchImplCpp<false, false>(art::interpreter::SwitchImplContext*)
    // _ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb0EEEvPNS0_17SwitchImplContextE
    private static get execute_switch_impl_cpp_0_0() {
        return getSym("_ZN3art11interpreter20ExecuteSwitchImplCppILb0ELb0EEEvPNS0_17SwitchImplContextE", "libart.so")!
    }

    static onValueChanged(key: string, value: number | string): void {
        if (key != "filterThreadId" && key != "filterMethodName") return
        LOGZ(`ExecuteSwitchImplCpp Got New Value -> ${key} -> ${value}`)
        if (key == "filterThreadId") ExecuteSwitchImplCppManager.filterThreadId = value as number
        if (key == "filterMethodName") ExecuteSwitchImplCppManager.filterMethodName = value as string
    }

    public static get execute_functions(): NativePointer[] {
        return [
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_1_0,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_0_1,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_1_1,
            ExecuteSwitchImplCppManager.execute_switch_impl_cpp_0_0,
        ].filter(it => it != null)
    }

    private static filterThreadId: number = -1
    private static filterMethodName: string = ''

    public static enableHook() {

        interpreter.CanUseMterp = true
        Instrumentation.ForceInterpretOnly()

        // class method_listeners extends InstrumentationListenerJsProxImpl {
        //     MethodEntered(thread: ArtThread, this_object: ObjPtr, method: ArtMethod, dex_pc: number): void {
        //         LOGD(`method_listeners -> MethodEntered: ${method.PrettyMethod(false)}`)
        //     }
        // }

        // Instrumentation.AddListener(new method_listeners(), InstrumentationEvent.kMethodEntered);

        ExecuteSwitchImplCppManager.execute_functions.forEach(hookAddress => {

            // ts impl
            Interceptor.attach(hookAddress, {
                onEnter: function (args) {
                    const ctx: SwitchImplContext = new SwitchImplContext(args[0])
                    if (!ctx.shadow_frame.method.methodName.includes(ExecuteSwitchImplCppManager.filterMethodName)) return

                    // LOGD(ctx.shadow_frame)
                    // ctx.shadow_frame.printBackTraceWithSmali()

                    if (ExecuteSwitchImplCppManager.filterThreadId != -1 && ExecuteSwitchImplCppManager.filterThreadId != Process.getCurrentThreadId()) {

                        // ctx.shadow_frame.printBackTraceWithSmali()

                        const threadInfo = `${Process.getCurrentThreadId()} ${ctx.self.GetThreadName()}`
                        const lastMethod: ArtMethod | null = ctx.shadow_frame.link.method
                        const lastMethodStr: string = lastMethod ? lastMethod.PrettyMethod(false) : "null"
                        const currentMethod = ctx.self.GetCurrentMethod().PrettyMethod(false)
                        LOGD(`${threadInfo} \n${lastMethodStr} -> ${currentMethod}`)

                    }

                    // const dexfile = ctx.self.GetCurrentMethod().GetDexFile()
                    // LOGD(ctx.accessor)
                    // let offset = 0
                    // let allsize = ctx.self.GetCurrentMethod().DexInstructions().insns_size_in_code_units
                    // while (allsize * 2 > offset) {
                    //     LOGD(ctx.accessor.InstructionAt(offset).dumpString(dexfile))
                    //     offset += ctx.accessor.InstructionAt(offset).SizeInCodeUnits
                    // }

                    // LOGD(ctx.shadow_frame)
                    // LOGD(ctx.result_register)
                    // newLine()
                }
            })

            // // cmodule impl
            // Interceptor.attach(hookAddress, new CModule(`
            // #include <stdio.h>
            // #include <glib.h>
            // #include <gum/gumprocess.h>
            // #include <gum/guminterceptor.h>

            // extern void _frida_log(const gchar * message);

            // static void frida_log(const char * format, ...) {
            //     gchar * message;
            //     va_list args;
            //     va_start (args, format);
            //     message = g_strdup_vprintf (format, args);
            //     va_end (args);
            //     _frida_log (message);
            //     g_free (message);
            // }

            // `, {
            //     _frida_log: new NativeCallback((message: NativePointer) => {
            //         LOGZ(message.readCString())
            //     }, 'void', ['pointer']),
            // }) as NativeInvocationListenerCallbacks)
        })
    }
}

setImmediate(() => {
    KeyValueStore.getInstance<string, number>().subscribe(ExecuteSwitchImplCppManager)
})
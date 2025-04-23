export class JSHandleNotImpl {

    public handle: NativePointer

    constructor(handle: NativePointer | number) {
        this.handle = (typeof handle === "number") ? ptr(handle) : handle
    }

    toString(): string {
        return `JSHandle< ${this.handle} >`
    }

    show(): void { LOGD(this.toString()) }

}

export class JSHandle extends JSHandleNotImpl implements SizeOfClass {

    get CurrentHandle(): NativePointer {
        return this.handle
    }

    get SizeOfClass(): number {
        return 0
    }

    get VirtualClassOffset(): number {
        return 0
    }

    get VirtualTableList(): NativePointer[] {
        if (this.VirtualClassOffset === Process.pointerSize) {
            const vtable = this.handle.readPointer()
            const vtableList: NativePointer[] = []
            let i = 0
            while (true) {
                const vtableItem = vtable.add(i * Process.pointerSize).readPointer()
                if (vtableItem.isNull()) break
                vtableList.push(vtableItem)
                i++
            }
            return vtableList
        }
        return []
    }

    public VirtualTablePrint(): void {
        this.VirtualTableList.map((item, index) => `[${index}] ${item}`).forEach(LOGD)
    }

    toString(): string {
        let disp: string = `JSHandle< ${this.handle} >`
        return disp
    }
}

declare global {
    var setExp: (handler: (exception: ExceptionDetails) => boolean) => void
}

globalThis.setExp = (handler: (exception: ExceptionDetails) => boolean = (exception: ExceptionDetails) => {
    LOGE(`\nCatch Exception:\nTYPE:${exception.type} | NCONTEXT: ${exception.nativeContext} | ADDRESS: ${exception.address} { ${DebugSymbol.fromAddress(exception.address)} }`)
    PrintStackTraceNative(exception.context, '', false, true)
    return true
}) => {
    Process.setExceptionHandler((exception: ExceptionDetails) => {
        if (handler(exception)) return false
        return true
    })
}
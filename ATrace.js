
class NativeTool{
     dlopen
     dlsym
    constructor() {
        this.dlopen = new NativeFunction(Module.findExportByName('libdl.so', 'dlopen'), 'pointer', ['pointer', 'int']);
        this.dlsym = new NativeFunction(Module.findExportByName('libdl.so', 'dlsym'), 'pointer', ['pointer', 'pointer']);
    }
    static getNativeFuc(fucAddr){

        let a = new NativeFunction(fucAddr, 'void',['pointer','pointer','pointer','pointer','pointer','pointer','pointer','pointer']);
        return a;
    }
}



function hook_dlopen(targetLib){
    var dlopen = Module.findExportByName(null, "android_dlopen_ext");
    if(dlopen == null){
        console.log("android_dlopen_ext not found, try android_dlopen");
    }
    Interceptor.attach(dlopen,{
        onEnter: function(args){
            let libName = Memory.readCString(args[0])
            
            if(libName.includes(targetLib)){
                this.tag =true;
                console.log(targetLib+" is loaded");
            }
        },
        onLeave: function(retval){
            if(this.tag){
                let base = Module.findBaseAddress(targetLib);               
                loadTraceTool(base);
            }
        }
    });    
}

function loadTraceTool(baseAddr) {
    let nativeTool = new NativeTool();
    let a = nativeTool.dlopen(Memory.allocUtf8String("system/lib64/libQBDI.so"),1)
    console.log(a)
    let handle = nativeTool.dlopen(Memory.allocUtf8String("system/lib64/libatrace.so"),1)
    console.log(handle)
    let fuc = nativeTool.dlsym(handle,Memory.allocUtf8String("_ZN6ATraceC2EPmS0_S0_PKmPcS3_S3_"))
    console.log(fuc)
    let targetFucAddr = Module.findBaseAddress("libmyapplication.so").add(0x67050)
    let showFucAddr = Module.findBaseAddress("libatrace.so").add(0x1ad10)
    Interceptor.attach(showFucAddr,{
        onEnter: function(args){
            
        },
        onLeave: function(retval){
          }
    })

    console.log(targetFucAddr)
    Interceptor.attach(targetFucAddr,{
        onEnter: function(args){
            console.log("beidiaoyongle")
            let aaa = NativeTool.getNativeFuc(fuc)
            console.log(targetFucAddr)
            console.log(Memory.readCString(args[0]))
            aaa(Memory.alloc(0xA0),targetFucAddr,Module.findBaseAddress("libmyapplication.so").add(0x67174),baseAddr,args[0],Memory.allocUtf8String("libmyapplication"),Memory.allocUtf8String("com.example.myapplication"),Memory.allocUtf8String("stringFromJNI"))
            console.log(targetFucAddr)
            console.log(Module.findBaseAddress("libmyapplication.so").add(0x67174))
        },
        onLeave: function(retval){
            console.log("leave")}
    })
  //  Interceptor.replace(targetFucAddr, new NativeCallback(function(arg0,arg1){
    //    console.log("beidiaoyongle")
    //    let aaa = NativeTool.getNativeFuc(fuc)
     //   console.log(targetFucAddr)

     //   aaa(Memory.alloc(0xA0),targetFucAddr,Module.findBaseAddress("libmyapplication.so").add(0x67174),arg0,Memory.allocUtf8String("libmyapplication"),Memory.allocUtf8String("com.example.myapplication"),Memory.allocUtf8String("stringFromJNI"))
     //   console.log(targetFucAddr)
     //   console.log(Module.findBaseAddress("libmyapplication.so").add(0x67174))
     //   return 0x00010006
 //   },'pointer',['pointer','pointer'])) 

}

function main(){

    hook_dlopen("libmyapplication.so");
}
setImmediate(main)

# Atrace
基于QBDI的android平台下arm64 so层trace工具
目前处于测试阶段，anroid9与andorid14测试可以正常使用，后续会上传demo
ATrace

后端trace逻辑。框架已经搭好，目前缺少对全局mem状态的输出。解决方案：在内存回调的逻辑中添加
在回调首次被触发时，进行全局的mem dump。 后续回调中，只记录修改部分。

一、基本用法：
通过frida注入libatrace.so，通过attach或者replace在目标函数中调用以下函数。
1：
ATrace(uint64_t *start,  //目标函数起始地址。
       uint64_t *end,      // 结束地址；
       uint64_t*baseAddr,   //模块基址；
       uint64_t *pointer,   //目标函数参数  后续添加相关解析参数逻辑，目前用来占位。
       char* name,     //模块名；
       char* pName,     //包名；
       char* fName);        //函数名；
初始化ATrace引擎；

2：
bool addTraceMemRW(); //trace 内存调用
bool addTraceAssemblyFllow();   //trace 执行流。
添加相应的trace逻辑。

3：
bool call(); //针对普通函数
bool callO(); //针对返回值是复杂对象的函数。 需要在x8寄存器存放返回对象大小的内存区域指针；
目前targetFuc 参数处理逻辑只是占位，后续添加相关功能。

二、主要类
AsyncThread.h 多线程类。IO耗时操作，放在线程。
MMapWrite.h  文件读写类，通过map操作，提高效率。

CallBackFuc  非类成员方法，都在该文件下。
    AsyncThread::Type traceArm(InstInfo*data, MMapWriter*mMapWriter)  //trace执行流的逻辑 目前执行流的逻辑与值分析逻辑耦合度较高，后续优化。
    AsyncThread::Type traceMemRW(std::vector<QBDI::MemoryAccess> memAccess,MMapWriter*mMapWriter)    //trace内存读写的逻辑。


MemTools  内存处理类。 目前还需要完善。
    ：内存读写关键API：process_vm_readv。
     通过lseek读取mem文件，如果有悬垂指针，会导致崩溃，使用process_vm_readv避免。
主要成员函数：
    std::string MemTools::printMemContent(uint64_t offAddr,int stringSize,MMapWriter*mMapWriter)
    readString(uint64_t ptr)
    analyzeValue(uint64_t offAddr);
以上是对寄存器值分析的关键函数。寄存器值存在3种可能，1。ascii即字符串，2.立即数，3.地址。
通过 analyzeValue(uint64_t offAddr);判断值类型。如果类型为地址，调用readString(uint64_t ptr)
判断该地址处是否为字符串，如果不是调用printMemContent(uint64_t offAddr,int stringSize,MMapWriter*mMapWriter)
进行hexdump。对于非字符串的地址，一律进行32字节dump。 #以上三个成员函数组合使用时有优化空间。遇到性能瓶颈优化。

//ATrace 前端分析引擎。
使用QT C++ 开发。前端UI完成之后再进行以下工作：

1.函数符号建模
2.寄存器状态建模
3.内存状态建模
4.***逆向污点追踪功能的实现。


参考文档：
    https://bbs.kanxue.com/thread-281555.htm  //从0开发你自己的Trace后端分析工具
    https://bbs.kanxue.com/thread-273055.htm  //[原创]使用时间无关调试技术(Timeless Debugging)高效分析混淆代码


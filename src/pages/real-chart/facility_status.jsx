import React, { useState, useEffect } from "react";
import { Auto_Button_Search, Auto_Card_Grid, Auto_Label_Text_Set, Auto_Radio_Useflag, TitleBar } from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useApiUrl } from "@/context/APIContext";   
import axios from "axios";
import TestImage from "@/components/assets/images/all-img/test_sample.png";
import FullButton from "@/components/autocomponent/areaGrid/Auto_Button_FullScreen";

const Dashboard = () => {
    const [filterMap, setFilterMap] = useState("usa");
    const [count, setCount] = useState(0);
    const apiUrl = useApiUrl(); // API URL 가져오기
    const [mdata, setMdata] = useState(null); // jbody를 저장할 상태 추가

    useEffect(() => {
        importData();
        // 1분(60초)마다 페이지 상태를 리셋
        const interval = setInterval(() => {
            setCount((prev) => prev + 1);
            importData();
        }, 10000); // 60000ms = 1분
        
        // 컴포넌트 언마운트 시 interval을 정리
        return () => clearInterval(interval);
    }, []);

    const importData = async () => {
        try {
            const url = `http://59.28.150.48:201/focas/focas_read.php`;
            const response = await axios.get(url);

            if (!response?.data) {
                console.error("No server response data.");
                setMdata(null);
                return;
            }
            
            const jbody = response.data;
            if (!jbody) {
                console.warn("The server returned an error response.", jbody);
                setMdata(null);
                return;
            }
            setMdata(jbody); // jbody를 상태로 설정
        } catch (error) {
            console.error("Data lookup error : ", error);
            setMdata(null);
        }
    }
    
    return (
        <div className="space-y-5">
            <TitleBar title="실시간 설비 현황" />
            <Card noborder>
                <div className="mb-3 w-[100%] text-right">
                    <FullButton/>
                </div>
                <div className="flex flex-wrap items-center justify-between">
                    <div className="w-full lg:w-[33%] sm:w-full mb-4 lg:mb-2 lg:pr-4 ">
                        <div className="w-full bg-slate-300 p-3 flex place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-t-xl">
                            <div className="ml-3">{mdata ? mdata.host_name : "Loading..."}</div>
                            <div className="mr-3">{mdata ? mdata.state : "Loading..."}</div>
                        </div>
                        <div className="w-full bg-slate-300 p-3 items-center justify-between dark:bg-slate-600">
                            <img src={TestImage} className="w-[100%] h-[200px]" />
                        </div>
                        <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-b-xl space-y-2">
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PRM NO.</div>
                                <div className="mr-2">{mdata ? mdata.program_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">TOOL NO.</div>
                                <div className="mr-2">{mdata ? mdata.tool_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">FEED</div>
                                <div className="mr-2">{mdata ? mdata.feed_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">SPD RPM</div>
                                <div className="mr-2">{mdata ? mdata.spindle_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PART COUNT</div>
                                <div className="mr-2">{mdata ? mdata.part_count : "Loading..."}</div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[33%] sm:w-full mb-4 lg:mb-2 lg:pr-4 ">
                        <div className="w-full bg-slate-300 p-3 flex place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-t-xl">
                            <div className="ml-3">{mdata ? mdata.host_name : "Loading..."}</div>
                            <div className="mr-3">{mdata ? mdata.state : "Loading..."}</div>
                        </div>
                        <div className="w-full bg-slate-300 p-3 items-center justify-between dark:bg-slate-600">
                            <img src={TestImage} className="w-[100%] h-[200px]" />
                        </div>
                        <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-b-xl space-y-2">
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PRM NO.</div>
                                <div className="mr-2">{mdata ? mdata.program_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">TOOL NO.</div>
                                <div className="mr-2">{mdata ? mdata.tool_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">FEED</div>
                                <div className="mr-2">{mdata ? mdata.feed_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">SPD RPM</div>
                                <div className="mr-2">{mdata ? mdata.spindle_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PART COUNT</div>
                                <div className="mr-2">{mdata ? mdata.part_count : "Loading..."}</div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[33%] sm:w-full mb-4 lg:mb-2 lg:pr-4 ">
                        <div className="w-full bg-slate-300 p-3 flex place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-t-xl">
                            <div className="ml-3">{mdata ? mdata.host_name : "Loading..."}</div>
                            <div className="mr-3">{mdata ? mdata.state : "Loading..."}</div>
                        </div>
                        <div className="w-full bg-slate-300 p-3 items-center justify-between dark:bg-slate-600">
                            <img src={TestImage} className="w-[100%] h-[200px]" />
                        </div>
                        <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-b-xl space-y-2">
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PRM NO.</div>
                                <div className="mr-2">{mdata ? mdata.program_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">TOOL NO.</div>
                                <div className="mr-2">{mdata ? mdata.tool_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">FEED</div>
                                <div className="mr-2">{mdata ? mdata.feed_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">SPD RPM</div>
                                <div className="mr-2">{mdata ? mdata.spindle_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PART COUNT</div>
                                <div className="mr-2">{mdata ? mdata.part_count : "Loading..."}</div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[33%] sm:w-full mb-4 lg:mb-2 lg:pr-4 ">
                        <div className="w-full bg-slate-300 p-3 flex place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-t-xl">
                            <div className="ml-3">{mdata ? mdata.host_name : "Loading..."}</div>
                            <div className="mr-3">{mdata ? mdata.state : "Loading..."}</div>
                        </div>
                        <div className="w-full bg-slate-300 p-3 items-center justify-between dark:bg-slate-600">
                            <img src={TestImage} className="w-[100%] h-[200px]" />
                        </div>
                        <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-b-xl space-y-2">
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PRM NO.</div>
                                <div className="mr-2">{mdata ? mdata.program_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">TOOL NO.</div>
                                <div className="mr-2">{mdata ? mdata.tool_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">FEED</div>
                                <div className="mr-2">{mdata ? mdata.feed_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">SPD RPM</div>
                                <div className="mr-2">{mdata ? mdata.spindle_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PART COUNT</div>
                                <div className="mr-2">{mdata ? mdata.part_count : "Loading..."}</div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[33%] sm:w-full mb-4 lg:mb-2 lg:pr-4 ">
                        <div className="w-full bg-slate-300 p-3 flex place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-t-xl">
                            <div className="ml-3">{mdata ? mdata.host_name : "Loading..."}</div>
                            <div className="mr-3">{mdata ? mdata.state : "Loading..."}</div>
                        </div>
                        <div className="w-full bg-slate-300 p-3 items-center justify-between dark:bg-slate-600">
                            <img src={TestImage} className="w-[100%] h-[200px]" />
                        </div>
                        <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-b-xl space-y-2">
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PRM NO.</div>
                                <div className="mr-2">{mdata ? mdata.program_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">TOOL NO.</div>
                                <div className="mr-2">{mdata ? mdata.tool_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">FEED</div>
                                <div className="mr-2">{mdata ? mdata.feed_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">SPD RPM</div>
                                <div className="mr-2">{mdata ? mdata.spindle_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PART COUNT</div>
                                <div className="mr-2">{mdata ? mdata.part_count : "Loading..."}</div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[33%] sm:w-full mb-4 lg:mb-2 lg:pr-4 ">
                        <div className="w-full bg-slate-300 p-3 flex place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-t-xl">
                            <div className="ml-3">{mdata ? mdata.host_name : "Loading..."}</div>
                            <div className="mr-3">{mdata ? mdata.state : "Loading..."}</div>
                        </div>
                        <div className="w-full bg-slate-300 p-3 items-center justify-between dark:bg-slate-600">
                            <img src={TestImage} className="w-[100%] h-[200px]" />
                        </div>
                        <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[20px] dark:text-white dark:bg-slate-600 rounded-b-xl space-y-2">
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PRM NO.</div>
                                <div className="mr-2">{mdata ? mdata.program_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">TOOL NO.</div>
                                <div className="mr-2">{mdata ? mdata.tool_number : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">FEED</div>
                                <div className="mr-2">{mdata ? mdata.feed_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">SPD RPM</div>
                                <div className="mr-2">{mdata ? mdata.spindle_RPM : "Loading..."}</div>
                            </div>
                            <div className="w-full bg-slate-100 p-2 rounded-xl flex place-content-between items-center justify-between dark:bg-slate-500">
                                <div className="ml-2">PART COUNT</div>
                                <div className="mr-2">{mdata ? mdata.part_count : "Loading..."}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div>페이지 리셋 확인용 : {count}</div>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;

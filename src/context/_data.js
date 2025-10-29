
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 탭 화면 구성을 위한 매뉴 리스트 import 
  // 2025-06-01 
  // import 구문 과 함께 
  // src -> component -> autoconponent -> common -> _data.js 로 이동함 . 
  // App.jsx에 정의된 유효한 경로 목록 및 컴포넌트 매핑 



import Dashboard from '@/pages/DashBoard/Dashboard2'; 
import CommonCodeGroup from '@/pages/common-info/CommonCodeGroup';
import CommonCodeGroupPerDesc from '@/pages/common-info/CommonCodeGroupPerDesc';
import EquipmentMaster from '@/pages/common-info/EquipmentMaster';
import UserManage from '@/pages/system-manage/UserMaster';
import ProgramMenuManage from '@/pages/system-manage/ProgramMenuManage';
import UserGroupPerMenuList from '@/pages/system-manage/UserGroupPerMenuList';
import PowerPredict from '@/pages/real-chart/power-predict';
import PowerState from '@/pages/real-chart/power-state';
import Trend from '@/pages/real-chart/trend';
import LoadRatio from '@/pages/real-chart/load-ratio';
import Monitoring from '@/pages/real-chart/monitoring';
import Cpk from '@/pages/real-chart/cpk';
import ProductMonitor from '@/pages/real-chart/product_monitor';
import FactoryState from '@/pages/real-chart/factory_state';
import FacilityStatus from '@/pages/real-chart/facility_status';
import MessageManage from '@/pages/system-manage/MessageManage';
import InstrumentMaster from '@/pages/common-info/InstrumentMaster';
import InstrumentHistory from '@/pages/history/InstrumentHistory';
import WorkerMaster from '@/pages/common-info/WorkerMaster';
import ProcessPerEquipment from '@/pages/common-info/ProcessPerEquipment';
import ProcessMaster from '@/pages/common-info/ProcessMaster';
import OPCMaster from '@/pages/system-manage/OPCMaster';
import UserConnectionHistory from '@/pages/system-manage/UserConnectionHistory';
import BrushChartEx from '@/pages/real-chart/BrushChart_Example';
import ProcessControlManage from '@/pages/common-info/ProcessControlManage';
import ElectricityLoadPerTimeSlot from '@/pages/common-info/ElectricityLoadPerTimeSlot';
import ElectricityTariffMaster from '@/pages/common-info/ElectricityTariffMaster';
import ProcessTargetUsage from '@/pages/common-info/ProcessTargetUsage'; 
import Processdefectrate from '@/pages/KPI/Processdefectrate';
import CarbonEmissionForecast from '@/pages/realtime/CarbonEmissionForecast';
import TemperatureTrend from '@/pages/realtime/TemperatureTrend';
import UserPerMenuList from '@/pages/system-manage/UserPerMenuList';
import FactoryTargetUsage from '@/pages/common-info/FactoryTargetUsage';
import RealtimeControlStatus from '@/pages/realtime/RealtimeControlStatus'
import RealtimeInfo from '@/pages/realtime/RealtimeInfo';
import OPCPerInstrument from '@/pages/system-manage/OPCPerInstrument';
import PowerLoadTrendForecast from '@/pages/realtime/PowerLoadTrendForecast';
import PowerLoadTrendProcess from '@/pages/realtime/PowerLoadTrendProcess';
import PowerLoadTrendEquipment from '@/pages/realtime/PowerLoadTrendEquipment';
import RealtimePowerFactorTrend from '@/pages/realtime/RealtimePowerFactorTrend';
import RealtimeElectricityCostForecast from '@/pages/realtime/RealtimeElectricityCostForecast';
import PowerQualityAnalysis from '@/pages/dataanalysis/PowerQualityAnalysis';
import PowerFactorQualityAnalysis from '@/pages/dataanalysis/PowerFactorQualityAnalysis';
import LoadRateAnalysis from '@/pages/dataanalysis/LoadRateAnalysis';
import PowerLoadAnalysis from '@/pages/dataanalysis/PowerLoadAnalysis';
import DailyPowerAnalysis from '@/pages/dataanalysis/DailyPowerAnalysis';
import WeeklyPowerAnalysis from '@/pages/dataanalysis/WeeklyPowerAnalysis';
import MonthlyPowerAnalysis from '@/pages/dataanalysis/MonthlyPowerAnalysis';
import Realtime from '@/pages/monitoring/Realtime';
import RealTimeInfo_Heating from '@/pages/monitoring/RealTimeInfo_Heating';
import PowerLoad from '@/pages/monitoring/PowerLoad';
import PowerQuality from '@/pages/monitoring/PowerQuality';
import TemperatureStatus_F1 from '@/pages/monitoring/TemperatureStatus_F1';
import PowerFactorChange from '@/pages/monitoring/PowerFactorChange';
import PowerFactorQuality from '@/pages/monitoring/PowerFactorQuality';
import EnergyUnitImprovementRate from '@/pages/KPI/EnergyUnitImprovementRate';
import GhgReductionPerformance from '@/pages/KPI/GhgReductionPerformance';
import IntegratedDashboard from '@/pages/DashBoard/IntegratedDashboard';
import ProcessDashboard from '@/pages/DashBoard/ProcessDashboard';
import EquipmentDashboard from '@/pages/DashBoard/EquipmentDashboard';
import PowerUsageStatusToOP from '@/pages/monitoring/PowerUsageStatusToOP';

export let availablePaths = [
    { label: '종합현황', path: '/Dashboard2', component: Dashboard  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"}, 
    { label: '공통코드 그룹 등록', path: '/CommonCodeGroup', component: CommonCodeGroup  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '공통코드 그룹 별 상세등록', path: '/CommonCodeGroupPerDesc', component: CommonCodeGroupPerDesc  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '설비 마스터', path: '/EquipmentMaster', component: EquipmentMaster  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '사용자 관리', path: '/UserMaster', component: UserManage  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '메뉴 관리', path: '/ProgramMenuManage', component: ProgramMenuManage  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '사용자 그룹 별 메뉴 관리', path: '/UserGroupPerMenuList', component: UserGroupPerMenuList  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y" },
    { label: '전력 부하 현황(예측) 그래프', path: '/power-predict', component: PowerPredict  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '전력 현황', path: '/power-state', component: PowerState  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '트랜드', path: '/trend', component: Trend  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '상별 부하율', path: '/load-ratio', component: LoadRatio , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '모니터링 현황', path: '/monitoring', component: Monitoring  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '공정능력 분석 CPK', path: '/cpk', component: Cpk  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '제품 모니터링 현황', path: '/product_monitor', component: ProductMonitor  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '공장 모니터링 현황', path: '/factory_state', component: FactoryState , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '실시간 설비 현황', path: '/facility_status', component: FacilityStatus  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '시스템 메시지 관리', path: '/MessageManage', component: MessageManage  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '계량기 관리', path: '/InstrumentMaster', component: InstrumentMaster  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '계량기 이력관리', path: '/InstrumentHistory', component: InstrumentHistory  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y" },
    { label: '작업자 마스터', path: '/WorkerMaster', component: WorkerMaster  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '공정 별 설비 마스터', path: '/ProcessPerEquipment', component: ProcessPerEquipment  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '공정 마스터', path: '/ProcessMaster', component: ProcessMaster  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: 'OPC 마스터', path: '/OPCMaster', component: OPCMaster  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '계측기 별 OPC 마스터', path: '/OPCPerInstrument', component: OPCPerInstrument  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '사용자 접속 이력 관리', path: '/UserConnectionHistory', component: UserConnectionHistory  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '부하 구분 별 시간대', path: '/ElectricityLoadPerTimeSlot', component: ElectricityLoadPerTimeSlot  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '공급 요금 단가 마스터', path: '/ElectricityTariffMaster', component: ElectricityTariffMaster  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '공정별 목표 사용량 관리', path: '/ProcessTargetUsage', component: ProcessTargetUsage  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '브러쉬 예제', path: '/BrushChartEx', component: BrushChartEx  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '공정 제어 관리', path: '/ProcessControlManage', component: ProcessControlManage  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"}, 
    { label: '공정불량율', path: '/Processdefectrate', component: Processdefectrate  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '탄소 배출량 현황-예측', path: '/CarbonEmissionForecast', component: CarbonEmissionForecast  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '온도 트랜드', path: '/TemperatureTrend', component: TemperatureTrend  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '사용자 별 메뉴관리', path: '/UserPerMenuList', component: UserPerMenuList  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: '제어 관리', path: '/FactoryTargetUsage', component: FactoryTargetUsage  , modifymanageauth  : "Y",  exceluploadauth : "Y", exceldownloadauth : "Y"},
    { label: "실시간 제어 현황", path: '/RealtimeControlStatus', component: RealtimeControlStatus, modifymanageauth : "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "제어상태", path: '/RealtimeInfo', component: RealtimeInfo, modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "전력부하 트랜드-예측", path: '/PowerLoadTrendForecast', component: PowerLoadTrendForecast, modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "전력부하 트랜드-공정", path: '/PowerLoadTrendProcess', component: PowerLoadTrendProcess, modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "전력부하 트랜드-설비", path: '/PowerLoadTrendEquipment', component: PowerLoadTrendEquipment, modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "실시간 역률 추이", path: '/RealtimePowerFactorTrend', component: RealtimePowerFactorTrend, modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "실시간 전력 요금 예측", path: '/RealtimeElectricityCostForecast', component: RealtimeElectricityCostForecast,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "전력 품질 분석", path: '/PowerQualityAnalysis', component: PowerQualityAnalysis,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "역률 품질 분석", path: '/PowerFactorQualityAnalysis', component: PowerFactorQualityAnalysis,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "상 부하율 분석", path: '/LoadRateAnalysis', component: LoadRateAnalysis,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "전력 부하 분석", path: '/PowerLoadAnalysis', component: PowerLoadAnalysis,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "일간 전력 분석", path: '/DailyPowerAnalysis', component: DailyPowerAnalysis,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "주간 전력 분석", path: '/WeeklyPowerAnalysis', component: WeeklyPowerAnalysis,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "월간 전력 분석", path: '/MontlyPowerAnalysis', component: MonthlyPowerAnalysis,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "실시간 정보", path: '/Realtime', component: Realtime,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "실시간 정보(가열로히팅)", path: '/RealTimeInfo_Heating', component: RealTimeInfo_Heating,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "전력부하", path: '/PowerLoad', component: PowerLoad,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "전력품질", path: '/PowerQuality', component: PowerQuality,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "온도현황", path: '/TemperatureStatus_F1', component: TemperatureStatus_F1,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "역률변화", path: '/PowerFactorChange', component: PowerFactorChange,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "역률품질", path: '/PowerFactorQuality', component: PowerFactorQuality,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "에너지 원단위 개선율", path: '/EnergyUnitImprovementRate', component: EnergyUnitImprovementRate,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "온실가스 감축성과", path: '/GhgReductionPerformance', component: GhgReductionPerformance,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "통합대시보드", path: '/IntegratedDashboard', component: IntegratedDashboard,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "공정별대시보드", path: '/ProcessDashboard', component: ProcessDashboard,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "설비별대시보드", path: '/EquipmentDashboard', component: EquipmentDashboard,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
    { label: "가동대비전력현황", path: '/PowerUsageStatusToOP', component: PowerUsageStatusToOP,  modifymanageauth: "Y", exceluploadauth: "Y", exceldownloadauth: "Y"},
  ]; 

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 매뉴 리스트
// login-form.jsx 의 handleLoginSuccess() 에서 매뉴 리스트를 DB 에서 가져와 세팅. 
//   > /sys/login-menulist Url 로 SP_LogInAndMenuList_R 프로시저 호출 
// 신규 매뉴 등록 순서 
// 1. 시스템 관리 의 매뉴 등록
// 2. 사용자권한 별 매뉴 관리 등록 
// 3. App.jsx 에 매뉴 리스트 등록 (70 행 , 130 행 2군데)
// 4. src/layout/Layout.jsx 에 매뉴 리스트 등록 (30행,  80 행 참조 )
export let menuItems = [];



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

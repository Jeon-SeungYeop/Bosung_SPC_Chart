import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import Auto_Button from "@/components/autocomponent/common/Auto_Button";
import Icon from "@/components/ui/Icon";

const Auto_SaveCloseModal = ({
  activeModal,
  onClose,
  noFade,
  disableBackdrop,
  children,
  footerContent,
  centered,
  scrollContent,
  title = "Basic Modal",
  width = "w-full", // Default width to full width
  height = "h-auto", // Default height to auto
  onSubmit, // 부모 컴포넌트에서 전달받은 onSubmit 함수
  message, // 메시지를 받도록 추가
  buttonHide  
}) => {
  const [loading, setLoading] = useState(false);

  const onExcute = async () => {
    setLoading(true); // 로딩 시작
    try {
      await onSubmit(); // 부모에서 전달받은 함수 실행
    } catch (error) {
      console.error("Error executing onSubmit:", error);
    } finally {
      setLoading(false); // 완료 후 로딩 종료
    }
  };

  return (
    <>
      <Transition appear show={activeModal} as={Fragment}>
        <Dialog as="div" className="relative z-[99999]" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter={noFade ? "" : "duration-300 ease-out"}
            enterFrom={noFade ? "" : "opacity-0"}
            enterTo={noFade ? "" : "opacity-100"}
            leave={noFade ? "" : "duration-200 ease-in"}
            leaveFrom={noFade ? "" : "opacity-100"}
            leaveTo={noFade ? "" : "opacity-0"}
          >
            {!disableBackdrop && (
              <div
                className="fixed inset-0 bg-slate-900/50 backdrop-filter backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()} // 배경 클릭 시 동작을 막음
              />
            )}
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div
              className={`flex min-h-full justify-center items-center text-center p-6 ${
                centered ? "items-center" : "items-start"
              }`}
            >
              <Transition.Child
                as={Fragment}
                enter={noFade ? "" : "duration-300 ease-out"}
                enterFrom={noFade ? "" : "opacity-0 scale-95"}
                enterTo={noFade ? "" : "opacity-100 scale-100"}
                leave={noFade ? "" : "duration-200 ease-in"}
                leaveFrom={noFade ? "" : "opacity-100 scale-100"}
                leaveTo={noFade ? "" : "opacity-0 scale-95"}
              >
                <Dialog.Panel
                  className={`transform overflow-hidden rounded-md
                    bg-white dark:bg-slate-800 text-left align-middle shadow-xl transition-alll
                    ${width} ${height}`} //
                >
                  <div
                    className={`relative overflow-hidden py-4 px-5 text-white bg-slate-100 flex justify-between bg-slate-100 dark:bg-slate-800 dark:border-b dark:border-slate-700 font-bold text-black dark:text-white items-center`}
                  >
                    <h2 className="capitalize leading-6 tracking-wider font-medium text-base text-black dark:text-white">
                      {title}
                    </h2>
                    <Auto_Button
                      onClick={onClose}
                      className="text-[22px] transform transition-transform duration-200 hover:scale-150"
                      disabled={loading}
                    >
                      <Icon icon="heroicons-outline:x" className="text-black-800 dark:text-white"/>
                    </Auto_Button>
                  </div>
                  <div
                    className={`px-6 py-8 ${
                      scrollContent ? "overflow-y-auto max-h-[400px]" : ""
                    }`}
                  >
                    {children}
                  </div>
                  {footerContent && (
                    <div className="px-4 py-3 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700">
                      {footerContent}
                    </div>
                  )}

                  {/* 버튼 그룹 */}
                  {!buttonHide ? (
                  <div className=" flex justify-end  space-x-4  px-6  mt-[-25px]">
                    {/* 저장 버튼 */}
                    <Auto_Button
                      type="submit"
                      onClick={onExcute} // 저장 함수 실행
                      className="btn bg-slate-400 btn-dark h-min w-max text-sm font-normal flex items-center space-x-2 group" // group 클래스를 추가하여 버튼에 마우스 오버 시 효과 적용
                      isLoading={loading}
                    >
                      {/* 아이콘 추가 */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 group-hover:scale-150 transform transition-transform duration-200" // group-hover로 버튼에 마우스 오버 시 아이콘 크기 증가
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4 12l6 6L20 6"
                        />
                      </svg>
                      {/* 버튼 텍스트 */}
                      확인
                    </Auto_Button>

                    {/* 닫기 버튼 */}
                    <Auto_Button
                      type="button" // button type을 "button"으로 변경하여 폼 제출을 방지
                      onClick={onClose} // 닫기 버튼 클릭 시 모달 닫기
                      className="btn bg-slate-400 btn-dark h-min w-max text-sm font-normal flex items-center space-x-2 group" // group 클래스를 추가하여 버튼에 마우스 오버 시 효과 적용
                      disabled={loading}
                    >
                      <Icon
                        icon="heroicons-outline:x"
                        className="w-5 h-5 group-hover:scale-150 transform transition-transform duration-200" // group-hover로 버튼에 마우스 오버 시 아이콘 크기 증가
                      />
                      <span>닫기</span> {/* 텍스트 */}
                    </Auto_Button>
                  </div>
                  ): null}
                  {/* 메시지 출력 영역 */}
                  {message && (
                    <div className={`px-6 py-6 text-lefte font-semibold  `}>
                      {message}
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Auto_SaveCloseModal;

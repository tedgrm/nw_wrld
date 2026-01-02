import React, { useMemo, useCallback, useState } from "react";
import { FaCode, FaDice, FaPlay } from "react-icons/fa";
import {
  TextInput,
  NumberInput,
  ColorInput,
  Select,
  Checkbox,
} from "./FormInputs.js";
import { MatrixGrid } from "../shared/MatrixGrid.jsx";

export const MethodBlock = React.memo(
  ({
    method,
    mode = "dashboard",
    moduleMethods = [],
    moduleName = null,
    dragHandleProps = null,
    onRemove = null,
    onShowCode = null,
    onTrigger = null,
    onOptionChange = null,
    onToggleRandom = null,
    onRandomRangeChange = null,
    onAddMissingOption = null,
  }) => {
    const [isFlashing, setIsFlashing] = useState(false);

    const methodOptions = useMemo(
      () => moduleMethods.find((m) => m.name === method.name)?.options || [],
      [moduleMethods, method.name]
    );

    const handleOptionChange = useCallback(
      (optionName, value) => {
        if (onOptionChange) {
          onOptionChange(method.name, optionName, value);
        }
      },
      [method.name, onOptionChange]
    );

    const renderInput = (option, currentOption) => {
      const isRandomized = Array.isArray(currentOption.randomRange);
      const optionDef = moduleMethods
        .find((m) => m.name === method.name)
        ?.options.find((o) => o.name === option.name);
      const allowRandomization = optionDef?.allowRandomization || false;

      if (mode === "editor") {
        if (option.type === "number") {
          return (
            <NumberInput
              value={currentOption.value}
              min={option.min}
              max={option.max}
              onChange={(e) => handleOptionChange(option.name, e.target.value)}
            />
          );
        } else if (option.type === "select") {
          return (
            <Select
              value={currentOption.value}
              onChange={(e) => handleOptionChange(option.name, e.target.value)}
            >
              {option.values.map((val) => (
                <option key={val} value={val} className="bg-[#101010]">
                  {val}
                </option>
              ))}
            </Select>
          );
        } else if (option.type === "text") {
          return (
            <TextInput
              value={currentOption.value}
              onChange={(e) => handleOptionChange(option.name, e.target.value)}
              className="w-20 py-0.5"
            />
          );
        } else if (option.type === "color") {
          return (
            <ColorInput
              value={currentOption.value}
              onChange={(e) => handleOptionChange(option.name, e.target.value)}
            />
          );
        } else if (option.type === "boolean") {
          return (
            <Checkbox
              checked={currentOption.value}
              onChange={(e) =>
                handleOptionChange(option.name, e.target.checked)
              }
            />
          );
        } else if (option.type === "matrix") {
          return (
            <MatrixGrid
              value={currentOption.value}
              onChange={(value) => handleOptionChange(option.name, value)}
            />
          );
        }
      } else {
        if (isRandomized) {
          return (
            <div className="flex gap-2">
              {option.type === "boolean" ? (
                <>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[9px] text-neutral-300/30">min:</div>
                    <Select
                      value={currentOption.randomRange[0] ? "true" : "false"}
                      onChange={(e) =>
                        onRandomRangeChange &&
                        onRandomRangeChange(option.name, 0, e.target.value)
                      }
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[9px] text-neutral-300/30">max:</div>
                    <Select
                      value={currentOption.randomRange[1] ? "true" : "false"}
                      onChange={(e) =>
                        onRandomRangeChange &&
                        onRandomRangeChange(option.name, 1, e.target.value)
                      }
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[9px] text-neutral-300/30">min:</div>
                    <NumberInput
                      value={currentOption.randomRange[0]}
                      onChange={(e) =>
                        onRandomRangeChange &&
                        onRandomRangeChange(option.name, 0, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[9px] text-neutral-300/30">max:</div>
                    <NumberInput
                      value={currentOption.randomRange[1]}
                      onChange={(e) =>
                        onRandomRangeChange &&
                        onRandomRangeChange(option.name, 1, e.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </div>
          );
        } else if (option.type === "number") {
          return (
            <NumberInput
              value={currentOption.value}
              min={option.min}
              max={option.max}
              onChange={(e) => handleOptionChange(option.name, e.target.value)}
            />
          );
        } else if (option.type === "select") {
          return (
            <Select
              value={currentOption.value}
              onChange={(e) => handleOptionChange(option.name, e.target.value)}
            >
              {option.values.map((val) => (
                <option key={val} value={val} className="bg-[#101010]">
                  {val}
                </option>
              ))}
              <option value="random" className="bg-[#101010]">
                random
              </option>
            </Select>
          );
        } else if (option.type === "text") {
          return (
            <TextInput
              value={currentOption.value}
              onChange={(e) => handleOptionChange(option.name, e.target.value)}
              className="w-20 py-0.5"
            />
          );
        } else if (option.type === "color") {
          return (
            <ColorInput
              value={currentOption.value}
              onChange={(e) => handleOptionChange(option.name, e.target.value)}
            />
          );
        } else if (option.type === "boolean") {
          return (
            <Checkbox
              checked={currentOption.value}
              onChange={(e) =>
                handleOptionChange(option.name, e.target.checked)
              }
            />
          );
        } else if (option.type === "matrix") {
          return (
            <MatrixGrid
              value={currentOption.value}
              onChange={(value) => handleOptionChange(option.name, value)}
            />
          );
        }
      }

      return null;
    };

    return (
      <div
        className={`flex flex-col border w-fit flex-shrink-0 ${
          isFlashing ? "border-red-500" : "border-neutral-600"
        }`}
      >
        <div className="relative py-2 px-3 font-mono">
          <div className="h-0 -translate-y-[17px] w-full px-2 min-w-max flex justify-between items-baseline mb-2">
            <span
              className={`px-1 mr-4 text-[11px] font-mono text-neutral-300 bg-[#101010] ${
                mode === "dashboard" &&
                dragHandleProps &&
                method.name !== "matrix"
                  ? "cursor-move"
                  : "cursor-default"
              }`}
              {...(mode === "dashboard" && dragHandleProps
                ? dragHandleProps
                : {})}
            >
              {mode === "dashboard" && method.name !== "matrix" && (
                <span className="text-md text-neutral-300">{"\u2261 "}</span>
              )}
              <span className="opacity-80">{method.name}</span>
            </span>

            <div className="flex items-center gap-2">
              {mode === "dashboard" && moduleName && onShowCode && (
                <div
                  className="px-1 text-neutral-300/50 cursor-pointer text-[11px] bg-[#101010]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowCode(method.name);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="View Method Code"
                >
                  <FaCode className="text-[10px]" />
                </div>
              )}
              {mode === "dashboard" && onRemove && (
                <div
                  className="px-1 text-red-500/50 cursor-pointer text-[11px] bg-[#101010]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(method.name);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Delete Method"
                >
                  [{"\u00D7"}]
                </div>
              )}
              {mode === "editor" && onTrigger && (
                <div
                  className="px-1 text-red-500/50 cursor-pointer text-[11px] bg-[#101010]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlashing(true);
                    onTrigger(method);
                    setTimeout(() => {
                      setIsFlashing(false);
                    }, 50);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Trigger Method"
                >
                  <FaPlay className="text-[10px]" />
                </div>
              )}
            </div>
          </div>

          <div
            className={`pt-2 grid gap-4 font-mono ${
              methodOptions?.length === 1
                ? "grid-cols-1"
                : methodOptions?.length >= 2
                ? "grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {methodOptions?.map((option) => {
              const currentOption = method.options.find(
                (o) => o.name === option.name
              );

              if (!currentOption) {
                if (mode === "dashboard" && onAddMissingOption) {
                  return (
                    <div
                      className="w-[192px] text-[11px] text-neutral-300 font-mono flex items-center gap-2"
                      key={option.name}
                    >
                      <span>ERROR: Missing key "{option.name}"</span>
                      <button
                        onClick={() =>
                          onAddMissingOption(method.name, option.name)
                        }
                        className="py-0.5 px-2 text-[11px] font-mono bg-white/5 text-neutral-300 border border-neutral-300 cursor-pointer whitespace-nowrap hover:bg-neutral-300 hover:text-[#101010]"
                        title="Add missing option with default value"
                      >
                        Fix
                      </button>
                    </div>
                  );
                }
                return null;
              }

              const optionDef = moduleMethods
                .find((m) => m.name === method.name)
                ?.options.find((o) => o.name === option.name);
              const allowRandomization = optionDef?.allowRandomization || false;
              const isRandomized = Array.isArray(currentOption.randomRange);

              return (
                <div
                  key={option.name}
                  className="flex flex-col gap-1 text-[11px] text-neutral-300 font-mono"
                >
                  <div className="inline-flex items-center font-mono">
                    {option.name}:
                    {mode === "dashboard" &&
                      allowRandomization &&
                      onToggleRandom && (
                        <FaDice
                          className={`ml-1.5 cursor-pointer text-[10px] ${
                            isRandomized
                              ? "text-neutral-300"
                              : "text-neutral-300/30"
                          }`}
                          onClick={() =>
                            onToggleRandom(option.name, currentOption.value)
                          }
                          title="Toggle Randomization"
                        />
                      )}
                  </div>
                  {renderInput(option, currentOption)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

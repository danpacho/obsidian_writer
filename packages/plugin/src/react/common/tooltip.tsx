import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTimer } from '../hooks'
import { tw } from '../tw'
import { TailwindComponent } from './tailwind.component'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps
    extends ReturnType<typeof useTooltip>,
        TailwindComponent,
        React.HTMLAttributes<HTMLDivElement> {
    tooltipContent: React.ReactNode
    children: React.ReactNode
}

const tooltip = tw.style({
    position: 'absolute',
    zIndex: 'z-10',
    paddingY: 'py-2',
    paddingX: 'px-2.5',
    color: 'text-white',
    backgroundColor: 'bg-black',
    fontSize: 'text-sm/5',
    borderRadius: 'rounded-lg',
    boxShadow: 'shadow-2xl',
    transition: 'transition-opacity ease-out',
    transitionDuration: 'duration-300',
})

const visibility = tw.toggle({
    truthy: {
        pointerEvents: 'pointer-events-auto',
        opacity: 'opacity-100',
    },
    falsy: {
        pointerEvents: 'pointer-events-none',
        opacity: 'opacity-0',
    },
})

const arrowStyles = tw.rotary({
    base: {
        backgroundColor: 'bg-black',
        boxShadow: 'shadow-2xl',
        width: 'w-2',
        height: 'h-2',
        transformOrigin: 'origin-center',
        transformRotate: 'rotate-45',
        transition: 'transition-opacity ease-out',
        transitionDuration: 'duration-300',
    },
    top: {
        left: 'left-1/2',
        bottom: 'bottom-0',
        transformTranslateX: '-translate-x-1/2',
        transformTranslateY: 'translate-y-1/2',
    },
    bottom: {
        left: 'left-1/2',
        top: 'top-0',
        transformTranslateX: '-translate-x-1/2',
        transformTranslateY: '-translate-y-1/2',
    },
    left: {
        top: 'top-1/2',
        right: 'right-0',
        transformTranslateX: 'translate-x-1/2',
        transformTranslateY: '-translate-y-1/2',
    },
    right: {
        top: 'top-1/2',
        left: 'left-0',
        transformTranslateX: '-translate-x-1/2',
        transformTranslateY: '-translate-y-1/2',
    },
})

export const useTooltip = ({
    delay = 750,
    position = 'top',
}: {
    delay: number
    position: TooltipPosition
}) => {
    const [active, setActive] = useState(false)
    const [visible, setVisible] = useState(false)
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
        opacity: 0,
    })
    const tooltipRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)

    const { startTimer, clearTimer } = useTimer(
        {
            start: () => {
                if (active) setVisible(true)
                else setVisible(false)
            },
            clear: () => {
                if (!active) return
                setActive(false)
                setVisible(false)
            },
        },
        delay
    )

    const calculatePosition = useCallback(() => {
        if (!tooltipRef.current || !triggerRef.current) return

        const triggerRect = triggerRef.current.getBoundingClientRect()
        const tooltipRect = tooltipRef.current.getBoundingClientRect()

        if (!triggerRect || !tooltipRect) return

        const PADDING = 12 as const
        let style: React.CSSProperties = {}
        switch (position) {
            case 'top':
                style = {
                    left: triggerRect.width / 2,
                    top: -PADDING - tooltipRect.height,
                    transform: 'translate(-50%, 0)',
                }
                break
            case 'bottom':
                style = {
                    left: triggerRect.width / 2,
                    top: triggerRect.height + PADDING,
                    transform: 'translate(-50%, 0)',
                }
                break
            case 'left':
                style = {
                    left: -PADDING - tooltipRect.width,
                    top: triggerRef.current.scrollHeight / 2,
                    transform: 'translate(0, -50%)',
                }
                break
            case 'right':
                style = {
                    left: triggerRect.width + PADDING,
                    top: triggerRef.current.scrollHeight / 2,
                    transform: 'translate(0, -50%)',
                }
                break
        }

        setTooltipStyle(style)
    }, [position])

    return {
        tooltipRef,
        triggerRef,
        active,
        visible,
        tooltipStyle,
        setActive,
        setVisible,
        calculatePosition,
        startTimer,
        clearTimer,
        position,
    }
}

/**
 * Tooltip component that displays additional information when hovering over an element.
 * @example
 * ```tsx
 * const controller = useTooltip({ delay: 500, position: 'top' })
 * //...
 * <Tooltip {...controller} content="This is a tooltip">
 *   <button>Hover me</button>
 * </Tooltip>
 * ```
 */
export const Tooltip = ({
    tooltipContent: content,
    children,
    tw: style,
    ...controller
}: TooltipProps) => {
    useEffect(() => {
        controller.calculatePosition()
    }, [controller.active, controller.calculatePosition])

    const tooltipStyle = style
        ? tooltip.compose(visibility.style(controller.visible), style).class
        : tooltip.compose(visibility.style(controller.visible)).class

    return (
        <div
            {...controller}
            className={`relative inline-block h-auto w-[inherit] ${controller.className}`}
            ref={controller.triggerRef}
            onPointerEnter={() => {
                controller.setActive(true)
                controller.startTimer()
            }}
            onPointerLeave={() => {
                controller.setActive(false)
                controller.clearTimer()
            }}
        >
            {children}

            <div
                ref={controller.tooltipRef}
                className={tooltipStyle}
                style={controller.tooltipStyle}
            >
                <span
                    className={`absolute ${visibility.class(controller.visible)} ${arrowStyles.class(controller.position)}`}
                />
                <span className="min-w-32 text-pretty text-center">
                    {content}
                </span>
            </div>
        </div>
    )
}

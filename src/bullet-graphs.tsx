import React from 'react'
import { style } from 'typestyle'
import { cssColor, rgba } from './color'
import {
  joinNames,
  Panel,
  PanelContent,
  row,
  Text,
  Tooltip,
} from './components'

export type BulletGraphProps = {
  // TODO: need multiple
  backgroundColor: string
  min: number
  max: number
  value: number
  targetValues: Array<{ label?: string; value: number }>
  color: string
}

export function BulletGraph({
  backgroundColor,
  min,
  max,
  value,
  targetValues,
  color,
}: BulletGraphProps) {
  return (
    <Tooltip
      content={
        <Panel flush>
          <PanelContent>
            <Text body>
              {value % 1 !== 0 ? value.toPrecision(2) : `${value}`}
            </Text>
          </PanelContent>
        </Panel>
      }
    >
      <div className={joinNames(bulletContainer, row)}>
        <div
          className={bulletBackground}
          style={{
            backgroundColor,
          }}
        >
          <div className={bulletTrough}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                backgroundColor: cssColor(rgba(0, 0, 0, 0.5)),
                borderRadius: '4px',
                transition: '0.2s',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: `${(100 * (max - value)) / (max - min)}%`,
                backgroundColor: color,
                borderRadius: '4px',
                transition: '0.2s',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: '4px',
                left: 0,
                right: `${(100 * (max - value)) / (max - min)}%`,
                backgroundColor: cssColor(rgba(255, 255, 255, 0.3)),
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
                transition: '0.2s',
              }}
            />
            {targetValues.map(({ label, value }) => {
              return (
                <div
                  key={label}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${(100 * (value - min)) / (max - min)}%`,
                    right: `${(100 * (max - value)) / (max - min)}%`,
                    transition: '0.2s',
                  }}
                >
                  {label ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-16px',
                        left: '0',
                      }}
                    >
                      <div className={targetText}>
                        <Text caption>{label}</Text>
                      </div>
                    </div>
                  ) : null}
                  <div
                    style={{
                      position: 'absolute',
                      top: '24px',
                      left: '0',
                    }}
                  >
                    <div className={targetText}>
                      <Text caption>{`${value}`}</Text>
                    </div>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      bottom: '-4px',
                      left: '-2px',
                      right: '-2px',
                      backgroundColor: '#000000',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Tooltip>
  )
}

const bulletContainer = style({
  // width: '100%',
  margin: '12px 0',
})

const bulletTrough = style({
  position: 'relative',
  flex: 1,
  padding: '4px',
})

const bulletBackground = style({
  borderRadius: '4px',
  padding: '8px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'fill',
  alignContent: 'center',
  flex: 1,
})

const targetText = style({
  transform: 'translate(-50%, -50%)',
})

// const bulletTarget = style({})

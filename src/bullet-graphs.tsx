import React, { Fragment } from 'react'
import { style } from 'typestyle'
import { cssColor, rgba } from './color'
import { joinNames, row, Text } from './components'

export type BulletGraphProps = {
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
    // <Tooltip
    //   content={
    //     <Panel flush>
    //       <PanelContent>
    //         <Text body>
    //           {value % 1 !== 0 ? value.toPrecision(2) : `${value}`}
    //         </Text>
    //       </PanelContent>
    //     </Panel>
    //   }
    // >
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
              boxShadow: '0 1px 1px 0 black',
            }}
          />
          {max === min ? null : (
            <Fragment>
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
                  backgroundColor: cssColor(rgba(255, 255, 255, 0.15)),
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px',
                  transition: '0.2s',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  top: '4px',
                  left: 0,
                  right: `${(100 * (max - value)) / (max - min)}%`,
                  backgroundColor: cssColor(rgba(0, 0, 0, 0.15)),
                  borderBottomLeftRadius: '4px',
                  borderBottomRightRadius: '4px',
                  transition: '0.2s',
                }}
              />
            </Fragment>
          )}
          {targetValues.map(({ label, value: val }, i) => {
            return (
              <div
                key={label || i}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${(100 * (val - min)) / (max - min)}%`,
                  right: `${(100 * (max - val)) / (max - min)}%`,
                  transition: '0.2s',
                }}
              >
                {label ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      // top: '38px',
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
                    <Text caption>{`${val}`}</Text>
                  </div>
                </div>
                {val !== min && val !== max ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      bottom: '-4px',
                      left: '-1px',
                      right: '-1px',
                      backgroundColor: '#000000',
                    }}
                  />
                ) : null}
              </div>
            )
          })}

          {/* <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${(100 * (value - min)) / (max - min)}%`,
              right: `${(100 * (max - value)) / (max - min)}%`,
              transition: '0.2s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-18px',
                left: '0',
              }}
            >
              <div className={targetText}>
                <Text caption>{'value'}</Text>
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                top: '27px',
                left: '0',
              }}
            >
              <div className={targetText}>
                <Text caption>{`${value}`}</Text>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
    // </Tooltip>
  )
}

const bulletContainer = style({
  // padding: '12px 0 12px',
  margin: '13px 0 14px',
})

const bulletTrough = style({
  position: 'relative',
  flex: 1,
  padding: '4px',
})

const bulletBackground = style({
  border: 'solid black 2px',
  borderRadius: '9999px',
  padding: '4px 12px 5px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'fill',
  alignContent: 'center',
  flex: 1,
})

const targetText = style({
  backgroundColor: '#ffffff',
  padding: '0 4px 0',
  transform: 'translate(-50%, -50%)',
})

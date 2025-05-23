// app/(admin)/admin/head.js

export default function Head() {
  return (
    <>
      {/* iPhone 세로 모드에서도 폭이 강제로 축소되지 않도록 고정 */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
    </>
  )
}

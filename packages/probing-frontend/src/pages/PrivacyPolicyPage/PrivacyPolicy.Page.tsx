import React, { useEffect } from 'react'

type OneTrustWindow = Window & {
  OneTrust?: {
    NoticeApi?: {
      Initialized: Promise<void>
      LoadNotices: (noticeUrls: Array<string>) => void
    }
  }
}

const extendedWindow = window as OneTrustWindow

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script')
    script.id = 'otprivacy-notice-script'
    script.src =
      'https://privacyportalde-cdn.onetrust.com/privacy-notice-scripts/otnotice-1.0.min.js'
    script.type = 'text/javascript'
    script.charset = 'UTF-8'
    script.setAttribute(
      'settings',
      'eyJjYWxsYmFja1VybCI6Imh0dHBzOi8vcHJpdmFjeXBvcnRhbC1kZS5vbmV0cnVzdC5jb20vcmVxdWVzdC92MS9wcml2YWN5Tm90aWNlcy9zdGF0cy92aWV3cyIsImNvbnRlbnRBcGlVcmwiOiJodHRwczovL3ByaXZhY3lwb3J0YWwtZGUub25ldHJ1c3QuY29tL3JlcXVlc3QvdjEvZW50ZXJwcmlzZXBvbGljeS9kaWdpdGFscG9saWN5L2NvbnRlbnQiLCJtZXRhZGF0YUFwaVVybCI6Imh0dHBzOi8vcHJpdmFjeXBvcnRhbC1kZS5vbmV0cnVzdC5jb20vcmVxdWVzdC92MS9lbnRlcnByaXNlcG9saWN5L2RpZ2l0YWxwb2xpY3kvbWV0YS1kYXRhIn0='
    )

    script.onload = () => {
      const noticeApi = extendedWindow.OneTrust?.NoticeApi
      if (noticeApi) {
        void noticeApi.Initialized.then(() => {
          noticeApi.LoadNotices([
            'https://privacyportalde-cdn.onetrust.com/storage-container/77f17844-04c3-4969-a11d-462ee77acbe1/privacy-notices/ae5b9e56-091c-421a-9323-6029e9ea9076/published/privacynotice.json',
          ])
        })
      }
    }

    document.head.appendChild(script)

    return () => {
      const el = document.getElementById('otprivacy-notice-script')
      if (el) el.remove()
    }
  }, [])

  return <div id="otnotice-ae5b9e56-091c-421a-9323-6029e9ea9076" className="otnotice"></div>
}

import { LANGUAGES } from '@/config/constants'
import { useSwitchPathLang } from '@/router'
import type { LangCode } from '@/types/commons.types'
import type { FooterLinksType } from '@pagopa/mui-italia'
import { Typography } from '@mui/material'
import { Footer as MUIItaliaFooter } from '@pagopa/mui-italia'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

type FooterLinksTypeMulti = Omit<FooterLinksType, 'label' | 'ariaLabel'> & { labelKey?: string }

const pagoPaLink = {
  label: 'PagoPA S.p.A.',
  href: 'https://www.pagopa.it',
  ariaLabel: 'Vai al sito di PagoPA S.p.A.',
  title: 'Vai al sito di PagoPA S.p.A.',
}

const LegalInfo = (
  <>
    <Typography variant="inherit" component="span" fontWeight={700}>
      PagoPA S.p.A.
    </Typography>{' '}
    — società per azioni con socio unico - capitale sociale di euro 1,000,000 interamente versato -
    sede legale in Roma, Piazza Colonna 370,
    <br />
    CAP 00187 - n. di iscrizione a Registro Imprese di Roma, CF e P.IVA 15376371009
  </>
)
export const Footer = () => {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'footer' })
  const navigate = useNavigate()
  const switchLang = useSwitchPathLang()
  const changeLanguageHandler = (lang: LangCode) => {
    switchLang(lang)
  }

  const links: Array<FooterLinksTypeMulti> = [
    {
      labelKey: 'privacy',
      onClick: () => {
        navigate('PRIVACY_POLICY')
      },
      linkType: 'internal',
    },
    {
      labelKey: 'dataProtection',
      href: 'https://privacyportal-de.onetrust.com/webform/77f17844-04c3-4969-a11d-462ee77acbe1/9ab6533d-be4a-482e-929a-0d8d2ab29df8',
      linkType: 'external',
    },
    {
      labelKey: 'terms',
      onClick: () => {
        navigate('TOS')
      },
      linkType: 'internal',
    },
    {
      labelKey: 'a11y',
      href: 'https://form.agid.gov.it/view/d96e090e-9d56-4d27-a70c-9a72186305b0/',
      linkType: 'external',
    },
  ]

  function convertLinks(inputLinks: Array<FooterLinksTypeMulti>) {
    return inputLinks.map((l) => {
      const link = { ...l }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const label = t(`links.${link.labelKey}.label`)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const ariaLabel = t(`links.${link.labelKey}.ariaLabel`)
      return { label, ariaLabel, ...l }
    })
  }
  return (
    <>
      <MUIItaliaFooter
        loggedUser={Boolean(true)}
        companyLink={pagoPaLink}
        legalInfo={LegalInfo}
        postLoginLinks={convertLinks(links) as Array<FooterLinksType>}
        preLoginLinks={{
          aboutUs: { title: 'Chi siamo', links: [] },
          resources: { title: 'Risorse', links: [] },
          followUs: { title: 'Seguici su', links: [], socialLinks: [] },
        }}
        onLanguageChanged={(lang) => changeLanguageHandler(lang as LangCode)}
        currentLangCode={i18n.language as LangCode}
        languages={LANGUAGES}
        hideProductsColumn={true}
      />
    </>
  )
}

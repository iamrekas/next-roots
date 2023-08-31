import { getLocaleFactory } from '~/utils/locale-utils'
import type { Config, Rewrite } from '../types'
import type { CompileParams } from './tpl-utils'
import {
  compileTemplateFactory,
  getOriginNameFactory,
  getOriginPathFactory,
  getPatternsFromNames,
} from './tpl-utils'

export const PATTERNS = getPatternsFromNames(
  'originName',
  'originPath',
  'locale'
)

export const tpl = `
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { middleware as ${PATTERNS.originName}Origin } from '${PATTERNS.originPath}'

export default function ${PATTERNS.originName}(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  return ${PATTERNS.originName}Origin(request, response, "${PATTERNS.locale}");
}
`

function getCompileParams(config: Config) {
  return (rewrite: Rewrite): CompileParams<typeof PATTERNS> => {
    const getOriginPath = getOriginPathFactory(config)
    const getOriginName = getOriginNameFactory('not-found')
    const getLocale = getLocaleFactory({
      defaultLocale: config.defaultLocale,
      locales: config.locales,
    })

    return {
      originPath: getOriginPath(rewrite),
      originName: getOriginName(rewrite),
      locale: getLocale(rewrite.localizedPath),
    }
  }
}

export function compileFactory(config: Config) {
  const getParams = getCompileParams(config)
  return (rewrite: Rewrite) => {
    const params = getParams(rewrite)

    const compileTemplate = compileTemplateFactory()

    return compileTemplate(tpl, params)
  }
}

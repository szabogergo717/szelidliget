import Oldal from '@/components/Oldal';
import { oldalAdat } from '@/lib/oldalAdat';

/**
 * Magyar főoldal. Minden kérésnél frissen kérdezi le az adatokat,
 * hogy egy áremelés azonnal látszódjon.
 */
export const dynamic = 'force-dynamic';

export default async function Fooldal() {
  const { hazak, extrak } = await oldalAdat('hu');
  return <Oldal nyelv="hu" hazak={hazak} extrak={extrak} />;
}

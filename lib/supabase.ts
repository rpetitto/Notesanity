import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://grvekfnafdcgvdnnnsub.supabase.co';
const supabaseKey = 'sb_publishable_Om5IPKFImGoJN20LfmXYBg_WuA2F3xf';

export const supabase = createClient(supabaseUrl, supabaseKey);
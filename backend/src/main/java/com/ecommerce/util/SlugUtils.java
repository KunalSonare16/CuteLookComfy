package com.ecommerce.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class SlugUtils {

    private static final Pattern NON_ASCII = Pattern.compile("[^\\p{ASCII}]");
    private static final Pattern NON_ALPHANUM = Pattern.compile("[^a-z0-9-]");
    private static final Pattern MULTI_DASH = Pattern.compile("-{2,}");
    private static final Pattern LEADING_TRAILING_DASH = Pattern.compile("^-|-$");

    public static String toSlug(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String ascii = NON_ASCII.matcher(normalized).replaceAll("");
        String lower = ascii.toLowerCase(Locale.ENGLISH);
        String alphanum = NON_ALPHANUM.matcher(lower.replace(' ', '-')).replaceAll("");
        String clean = MULTI_DASH.matcher(alphanum).replaceAll("-");
        return LEADING_TRAILING_DASH.matcher(clean).replaceAll("");
    }

    private SlugUtils() {}
}

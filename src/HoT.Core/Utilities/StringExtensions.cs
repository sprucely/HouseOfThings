using System;

namespace HoT.Core.Utilities
{
    public static class StringUtilities
    {
        public static string GetNextMidstring(this string prev, string next)
        {
            int p = 0, n = 0, pos = 0;
            string str = "";

            for (pos = 0; p == n; pos++) {               // find leftmost non-matching character
                p = pos < prev.Length ? prev[pos] : 96;
                n = pos < next.Length ? next[pos] : 123;
            }

            str = prev.Substring(0, pos - 1);                // copy identical part of string
            if (p == 96) {                               // prev string equals beginning of next
                while (n == 97) {                        // next character is 'a'
                    n = pos < next.Length ? next[pos++] : 123;  // get char from next
                    str += 'a';                          // insert an 'a' to match the 'a'
                }
                if (n == 98) {                           // next character is 'b'
                    str += 'a';                          // insert an 'a' to match the 'b'
                    n = 123;                             // set to end of alphabet
                }
            }
            else if (p + 1 == n) {                       // found consecutive characters
                str += (char)p;           // insert character from prev
                n = 123;                                 // set to end of alphabet
                while ((p = pos < prev.Length ? prev[pos++] : 96) == 122) {  // p='z'
                    str += 'z';                          // insert 'z' to match 'z'
                }
            }
            return str + (char)Math.Ceiling((double)(p + n) / 2); // append middle character
        }
    }
}
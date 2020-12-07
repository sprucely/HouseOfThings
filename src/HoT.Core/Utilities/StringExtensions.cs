using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BloomFilter;

namespace HoT.Core.Utilities
{
    public static class StringUtilities
    {
        private static Lazy<Filter<string>> _bloomFilter;

        static StringUtilities()
        {
            _bloomFilter = new Lazy<Filter<string>>(() =>
            {
                var filter = FilterBuilder.Build<string>(10000000, 0.01);
                filter.Add(StopWord.StopWords.GetStopWords("en").Select(w => w.ToLower()));
                return filter;
            });
        }

        public static string GetPreviousMidstring(this string prev, string next)
        {
            return GetNextMidstring(next, prev);
        }


        public static string GetNextMidstring(this string prev, string next)
        {
            int p = 0, n = 0, pos = 0;
            string str = "";

            for (pos = 0; p == n; pos++)
            {               // find leftmost non-matching character
                p = pos < prev.Length ? prev[pos] : 96;
                n = pos < next.Length ? next[pos] : 123;
            }

            str = prev.Substring(0, pos - 1);                // copy identical part of string
            if (p == 96)
            {                               // prev string equals beginning of next
                while (n == 97)
                {                        // next character is 'a'
                    n = pos < next.Length ? next[pos++] : 123;  // get char from next
                    str += 'a';                          // insert an 'a' to match the 'a'
                }
                if (n == 98)
                {                           // next character is 'b'
                    str += 'a';                          // insert an 'a' to match the 'b'
                    n = 123;                             // set to end of alphabet
                }
            }
            else if (p + 1 == n)
            {                       // found consecutive characters
                str += (char)p;           // insert character from prev
                n = 123;                                 // set to end of alphabet
                while ((p = pos < prev.Length ? prev[pos++] : 96) == 122)
                {  // p='z'
                    str += 'z';                          // insert 'z' to match 'z'
                }
            }
            return str + (char)Math.Ceiling((double)(p + n) / 2); // append middle character
        }

        public static bool IsStopWord(this string word)
        {
            return _bloomFilter.Value.Contains(word.ToLower());
        }

        public static IEnumerable<string> RemoveStopWords(this IEnumerable<string> words)
        {
            var bloomFilter = _bloomFilter.Value;
            foreach (var word in words)
            {
                if (!bloomFilter.Contains(word.ToLower()))
                    yield return word;
            }
        }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using HoT.Core.Utilities;

namespace HoT.Core.Data.Models
{
    public static class ModelExtensions
    {
        public static IEnumerable<string> GetTagNames(this LocationModel locationModel)
        {
            return (locationModel.Name ?? "").Split(" ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Concat((locationModel.Description ?? "").Split(" ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .RemoveStopWords()
                .Select(w => w.ToLower());
        }

        public static IEnumerable<string> GetTagNames(this ItemModel itemModel)
        {
            return (itemModel.Name ?? "").Split(" ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Concat((itemModel.Description ?? "").Split(" ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .RemoveStopWords()
                .Select(w => w.ToLower());
        }
    }
}